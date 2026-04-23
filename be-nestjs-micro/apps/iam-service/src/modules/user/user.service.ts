import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole as PrismaUserRole } from 'generated/iam';
import { IamPrismaService } from '@app/database';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';
import { CreateStaffUserCommand } from '@app/contracts/iam/user/commands/create-staff-user.command';
import { StaffUserDetailResult } from '@app/contracts/iam/user/results/staff-user-detail.result';
import { ListStaffUsersQuery } from '@app/contracts/iam/user/commands/list-staff-users.query';
import { PaginatedStaffUsersResult } from '@app/contracts/iam/user/results/paginated-staff-users.result';
import { GetStaffUserDetailQuery } from '@app/contracts/iam/user/commands/get-staff-user-detail.query';
import { UpdateStaffUserCommand } from '@app/contracts/iam/user/commands/update-staff-user.command';
import { DeleteStaffUserCommand } from '@app/contracts/iam/user/commands/delete-staff-user.command';
import { DeleteStaffUserResult } from '@app/contracts/iam/user/results/delete-staff-user.result';

@Injectable()
export class UserService {
  constructor(private readonly prisma: IamPrismaService) {}

  private ensureAdmin(actorRole: UserRole): void {
    if (actorRole !== UserRole.ADMIN) {
      throw new AppRpcException({
        code: ERRORS.FORBIDDEN.code,
        message: ERRORS.FORBIDDEN.message,
      });
    }
  }

  private mapStaffUserResult(user: {
    id: string;
    email: string;
    fullName: string | null;
    phoneNumber: string | null;
    role: PrismaUserRole;
    createdAt: Date;
    updatedAt: Date;
  }): StaffUserDetailResult {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role:
        user.role === PrismaUserRole.ADMIN
          ? UserRole.ADMIN
          : user.role === PrismaUserRole.STAFF
            ? UserRole.STAFF
            : UserRole.USER,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createStaff(
    command: CreateStaffUserCommand,
  ): Promise<StaffUserDetailResult> {
    this.ensureAdmin(command.actorRole);

    const existedEmail = await this.prisma.user.findUnique({
      where: { email: command.email },
    });

    if (existedEmail) {
      throw new AppRpcException({
        code: ERRORS.USER_EMAIL_ALREADY_EXISTS.code,
        message: ERRORS.USER_EMAIL_ALREADY_EXISTS.message,
      });
    }

    const existedPhone = await this.prisma.user.findFirst({
      where: { phoneNumber: command.phoneNumber },
    });

    if (existedPhone) {
      throw new AppRpcException({
        code: ERRORS.USER_PHONE_ALREADY_EXISTS.code,
        message: ERRORS.USER_PHONE_ALREADY_EXISTS.message,
      });
    }

    const hashedPassword = await bcrypt.hash(command.password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        email: command.email,
        fullName: command.fullName,
        phoneNumber: command.phoneNumber,
        password: hashedPassword,
        role: PrismaUserRole.STAFF,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapStaffUserResult(createdUser);
  }

  async listStaff(
    query: ListStaffUsersQuery,
  ): Promise<PaginatedStaffUsersResult> {
    this.ensureAdmin(query.actorRole);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;
    const keyword = query.keyword?.trim();

    const where = keyword
      ? {
          role: PrismaUserRole.STAFF,
          OR: [
            { email: { contains: keyword, mode: 'insensitive' as const } },
            { fullName: { contains: keyword, mode: 'insensitive' as const } },
            {
              phoneNumber: { contains: keyword, mode: 'insensitive' as const },
            },
          ],
        }
      : { role: PrismaUserRole.STAFF };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapStaffUserResult(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStaffDetail(
    query: GetStaffUserDetailQuery,
  ): Promise<StaffUserDetailResult> {
    this.ensureAdmin(query.actorRole);

    const staffUser = await this.prisma.user.findFirst({
      where: { id: query.id, role: PrismaUserRole.STAFF },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!staffUser) {
      throw new AppRpcException({
        code: ERRORS.USER_NOT_FOUND.code,
        message: ERRORS.USER_NOT_FOUND.message,
      });
    }

    return this.mapStaffUserResult(staffUser);
  }

  async updateStaff(
    command: UpdateStaffUserCommand,
  ): Promise<StaffUserDetailResult> {
    this.ensureAdmin(command.actorRole);

    const currentStaff = await this.prisma.user.findFirst({
      where: { id: command.id, role: PrismaUserRole.STAFF },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!currentStaff) {
      throw new AppRpcException({
        code: ERRORS.USER_NOT_FOUND.code,
        message: ERRORS.USER_NOT_FOUND.message,
      });
    }

    if (command.email && command.email !== currentStaff.email) {
      const existedEmail = await this.prisma.user.findUnique({
        where: { email: command.email },
      });
      if (existedEmail) {
        throw new AppRpcException({
          code: ERRORS.USER_EMAIL_ALREADY_EXISTS.code,
          message: ERRORS.USER_EMAIL_ALREADY_EXISTS.message,
        });
      }
    }

    if (
      command.phoneNumber &&
      command.phoneNumber !== (currentStaff.phoneNumber ?? undefined)
    ) {
      const existedPhone = await this.prisma.user.findFirst({
        where: {
          phoneNumber: command.phoneNumber,
          NOT: { id: command.id },
        },
      });
      if (existedPhone) {
        throw new AppRpcException({
          code: ERRORS.USER_PHONE_ALREADY_EXISTS.code,
          message: ERRORS.USER_PHONE_ALREADY_EXISTS.message,
        });
      }
    }

    const updateData: {
      email?: string;
      fullName?: string;
      phoneNumber?: string;
      password?: string;
    } = {};

    if (command.email !== undefined) {
      updateData.email = command.email;
    }
    if (command.fullName !== undefined) {
      updateData.fullName = command.fullName;
    }
    if (command.phoneNumber !== undefined) {
      updateData.phoneNumber = command.phoneNumber;
    }
    if (command.password !== undefined) {
      updateData.password = await bcrypt.hash(command.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: command.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapStaffUserResult(updatedUser);
  }

  async deleteStaff(
    command: DeleteStaffUserCommand,
  ): Promise<DeleteStaffUserResult> {
    this.ensureAdmin(command.actorRole);

    const currentStaff = await this.prisma.user.findFirst({
      where: { id: command.id, role: PrismaUserRole.STAFF },
      select: { id: true },
    });

    if (!currentStaff) {
      throw new AppRpcException({
        code: ERRORS.USER_NOT_FOUND.code,
        message: ERRORS.USER_NOT_FOUND.message,
      });
    }

    await this.prisma.user.delete({
      where: { id: command.id },
    });

    return {
      id: command.id,
      deleted: true,
    };
  }
}
