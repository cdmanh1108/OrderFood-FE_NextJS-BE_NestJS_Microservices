import { Injectable } from '@nestjs/common';
import { DeliveryPrismaService } from '@app/database/delivery-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import {
  DeliveryTaskStatus as PrismaTaskStatus,
  Prisma,
} from 'generated/delivery';
import {
  DeliveryTaskStatus,
} from '@app/contracts/delivery/enums/delivery-task-status.enum';

import type { CreateDeliveryTaskCommand } from '@app/contracts/delivery/task/commands/create-delivery-task.command';
import type { AssignTaskCommand } from '@app/contracts/delivery/task/commands/assign-task.command';
import type { UpdateTaskStatusCommand } from '@app/contracts/delivery/task/commands/update-task-status.command';
import type { ListTasksQuery, GetMyTasksQuery } from '@app/contracts/delivery/task/commands/list-tasks.query';
import type {
  DeliveryTaskDetailResult,
  PaginatedTasksResult,
} from '@app/contracts/delivery/task/results/delivery-task-detail.result';
import { ShipperService } from '../shipper/shipper.service';

// Valid status transitions: from → [allowed to]
const STATUS_TRANSITIONS: Record<DeliveryTaskStatus, DeliveryTaskStatus[]> = {
  [DeliveryTaskStatus.PENDING]: [DeliveryTaskStatus.ASSIGNED, DeliveryTaskStatus.CANCELLED],
  [DeliveryTaskStatus.ASSIGNED]: [DeliveryTaskStatus.PICKED_UP, DeliveryTaskStatus.CANCELLED],
  [DeliveryTaskStatus.PICKED_UP]: [DeliveryTaskStatus.IN_TRANSIT],
  [DeliveryTaskStatus.IN_TRANSIT]: [DeliveryTaskStatus.DELIVERED, DeliveryTaskStatus.FAILED],
  [DeliveryTaskStatus.DELIVERED]: [],
  [DeliveryTaskStatus.FAILED]: [],
  [DeliveryTaskStatus.CANCELLED]: [],
};

const TASK_INCLUDE = {
  shipper: true,
  proof: true,
  statusHistories: {
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.DeliveryTaskInclude;

type TaskWithRelations = Prisma.DeliveryTaskGetPayload<{
  include: typeof TASK_INCLUDE;
}>;

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: DeliveryPrismaService,
    private readonly shipperService: ShipperService,
  ) {}

  async create(
    command: CreateDeliveryTaskCommand,
  ): Promise<DeliveryTaskDetailResult> {
    // Prevent duplicate task for same order
    const existing = await this.prisma.deliveryTask.findUnique({
      where: { orderId: command.orderId },
      include: TASK_INCLUDE,
    });

    if (existing) {
      return this.mapToResult(existing);
    }

    const task = await this.prisma.deliveryTask.create({
      data: {
        orderId: command.orderId,
        recipientName: command.recipientName,
        recipientPhone: command.recipientPhone,
        deliveryAddress: command.deliveryAddress,
        deliveryLat: command.deliveryLat,
        deliveryLng: command.deliveryLng,
        note: command.note,
        statusHistories: {
          create: {
            fromStatus: null,
            toStatus: PrismaTaskStatus.PENDING,
            note: 'Tạo nhiệm vụ giao hàng',
          },
        },
      },
      include: TASK_INCLUDE,
    });

    return this.mapToResult(task);
  }

  async assign(command: AssignTaskCommand): Promise<DeliveryTaskDetailResult> {
    const [task, shipper] = await Promise.all([
      this.prisma.deliveryTask.findUnique({
        where: { id: command.taskId },
        include: TASK_INCLUDE,
      }),
      this.prisma.shipper.findUnique({ where: { id: command.shipperId } }),
    ]);

    if (!task) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy nhiệm vụ giao hàng',
      });
    }

    if (!shipper) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy shipper',
      });
    }

    if (task.status !== PrismaTaskStatus.PENDING) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể gán đơn khi nhiệm vụ ở trạng thái PENDING',
      });
    }

    if (!shipper.isActive) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Shipper đang không hoạt động, không thể nhận đơn',
      });
    }

    const updated = await this.prisma.deliveryTask.update({
      where: { id: command.taskId },
      data: {
        shipperId: command.shipperId,
        status: PrismaTaskStatus.ASSIGNED,
        assignedAt: new Date(),
        statusHistories: {
          create: {
            fromStatus: PrismaTaskStatus.PENDING,
            toStatus: PrismaTaskStatus.ASSIGNED,
            note: `Gán cho shipper: ${shipper.fullName}`,
          },
        },
      },
      include: TASK_INCLUDE,
    });

    return this.mapToResult(updated);
  }

  async updateStatus(
    command: UpdateTaskStatusCommand,
  ): Promise<DeliveryTaskDetailResult> {
    const task = await this.prisma.deliveryTask.findUnique({
      where: { id: command.taskId },
      include: TASK_INCLUDE,
    });

    if (!task) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy nhiệm vụ giao hàng',
      });
    }

    const currentStatus = task.status as DeliveryTaskStatus;
    const allowed = STATUS_TRANSITIONS[currentStatus];

    if (!allowed.includes(command.status)) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: `Không thể chuyển từ ${currentStatus} sang ${command.status}`,
      });
    }

    // Build timestamp fields based on new status
    const timestampData: Record<string, Date | null> = {};
    const now = new Date();
    if (command.status === DeliveryTaskStatus.PICKED_UP) timestampData.pickedUpAt = now;
    if (command.status === DeliveryTaskStatus.DELIVERED) timestampData.deliveredAt = now;
    if (command.status === DeliveryTaskStatus.FAILED) timestampData.failedAt = now;
    if (command.status === DeliveryTaskStatus.CANCELLED) timestampData.cancelledAt = now;

    const updated = await this.prisma.deliveryTask.update({
      where: { id: command.taskId },
      data: {
        status: command.status as PrismaTaskStatus,
        ...timestampData,
        statusHistories: {
          create: {
            fromStatus: task.status,
            toStatus: command.status as PrismaTaskStatus,
            note: command.note,
            changedBy: command.changedBy,
          },
        },
      },
      include: TASK_INCLUDE,
    });

    return this.mapToResult(updated);
  }

  async cancel(taskId: string, note?: string): Promise<DeliveryTaskDetailResult> {
    return this.updateStatus({
      taskId,
      status: DeliveryTaskStatus.CANCELLED,
      note,
    });
  }

  async findOne(id: string): Promise<DeliveryTaskDetailResult> {
    const task = await this.prisma.deliveryTask.findUnique({
      where: { id },
      include: TASK_INCLUDE,
    });

    if (!task) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy nhiệm vụ giao hàng',
      });
    }

    return this.mapToResult(task);
  }

  async findAll(query: ListTasksQuery): Promise<PaginatedTasksResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DeliveryTaskWhereInput = {};
    if (query.shipperId) where.shipperId = query.shipperId;
    if (query.orderId) where.orderId = query.orderId;
    if (query.status) where.status = query.status as PrismaTaskStatus;

    const [items, total] = await Promise.all([
      this.prisma.deliveryTask.findMany({
        where,
        include: TASK_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.deliveryTask.count({ where }),
    ]);

    return {
      items: items.map((t) => this.mapToResult(t)),
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async getMyTasks(query: GetMyTasksQuery): Promise<PaginatedTasksResult> {
    return this.findAll({
      shipperId: query.shipperId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
  }

  private mapToResult(task: TaskWithRelations): DeliveryTaskDetailResult {
    return {
      id: task.id,
      orderId: task.orderId,
      shipperId: task.shipperId,
      shipper: task.shipper
        ? this.shipperService.mapToResult(task.shipper)
        : null,
      status: task.status as DeliveryTaskStatus,
      recipientName: task.recipientName,
      recipientPhone: task.recipientPhone,
      deliveryAddress: task.deliveryAddress,
      deliveryLat: task.deliveryLat ? Number(task.deliveryLat) : null,
      deliveryLng: task.deliveryLng ? Number(task.deliveryLng) : null,
      note: task.note,
      assignedAt: task.assignedAt,
      pickedUpAt: task.pickedUpAt,
      deliveredAt: task.deliveredAt,
      failedAt: task.failedAt,
      cancelledAt: task.cancelledAt,
      proof: task.proof
        ? {
            id: task.proof.id,
            taskId: task.proof.taskId,
            mediaFileId: task.proof.mediaFileId,
            note: task.proof.note,
            submittedAt: task.proof.submittedAt,
          }
        : null,
      statusHistories: task.statusHistories.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus as DeliveryTaskStatus | null,
        toStatus: h.toStatus as DeliveryTaskStatus,
        note: h.note,
        changedBy: h.changedBy,
        createdAt: h.createdAt,
      })),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
