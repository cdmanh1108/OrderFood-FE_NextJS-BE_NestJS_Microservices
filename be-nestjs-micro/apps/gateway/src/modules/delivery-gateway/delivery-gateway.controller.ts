import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles, RolesGuard, JwtAuthGuard, CurrentUser } from '@app/auth';
import { DeliveryGatewayService } from './delivery-gateway.service';
import { CreateShipperDto } from './dto/create-shipper.dto';
import { UpdateShipperDto } from './dto/update-shipper.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { RecordLocationDto } from './dto/record-location.dto';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { DeliveryTaskStatus } from '@app/contracts/delivery/enums/delivery-task-status.enum';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryGatewayController {
  constructor(private readonly deliveryService: DeliveryGatewayService) { }

  // ─── Shipper Management (Admin) ───────────────────────────────────────────

  @Post('shippers')
  @Roles('ADMIN')
  async createShipper(@Body() dto: CreateShipperDto) {
    return this.deliveryService.createShipper(dto);
  }

  @Patch('shippers/:id')
  @Roles('ADMIN')
  async updateShipper(@Param('id') id: string, @Body() dto: UpdateShipperDto) {
    return this.deliveryService.updateShipper({ id, ...dto });
  }

  @Get('shippers')
  @Roles('ADMIN')
  async listShippers(
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.deliveryService.listShippers({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('shippers/:id')
  @Roles('ADMIN', 'STAFF')
  async getShipperDetail(@Param('id') id: string) {
    return this.deliveryService.getShipperDetail(id);
  }

  @Put('shippers/:id/deactivate')
  @Roles('ADMIN')
  async deactivateShipper(@Param('id') id: string) {
    return this.deliveryService.deactivateShipper(id);
  }

  @Get('me/shipper-profile')
  @Roles('SHIPPER')
  async getMyShipperProfile(@CurrentUser() user: any) {
    return this.deliveryService.getShipperByUserId(user.sub);
  }

  // ─── Task Management ──────────────────────────────────────────────────────

  @Post('tasks/:id/assign')
  @Roles('ADMIN', 'STAFF')
  async assignTask(@Param('id') id: string, @Body() dto: AssignTaskDto) {
    return this.deliveryService.assignTask({ taskId: id, shipperId: dto.shipperId });
  }

  @Get('tasks')
  @Roles('ADMIN', 'STAFF')
  async listTasks(
    @Query('shipperId') shipperId?: string,
    @Query('status') status?: DeliveryTaskStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.deliveryService.listTasks({
      shipperId,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('my-tasks')
  @Roles('SHIPPER')
  async getMyTasks(
    @CurrentUser() user: any,
    @Query('status') status?: DeliveryTaskStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // First need to get shipperId from userId
    const shipper = await this.deliveryService.getShipperByUserId(user.sub);
    return this.deliveryService.getMyTasks({
      shipperId: shipper.id,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('tasks/:id')
  async getTaskDetail(@Param('id') id: string) {
    // Accessible by Admin, Staff, Shipper assigned to it, and Customer who owns the order
    // Basic proxy for now, business logic could be tighter
    return this.deliveryService.getTaskDetail(id);
  }

  @Patch('tasks/:id/status')
  @Roles('SHIPPER', 'ADMIN', 'STAFF')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveryService.updateTaskStatus({
      taskId: id,
      status: dto.status,
      note: dto.note,
      changedBy: user.sub,
    });
  }

  @Post('tasks/:id/cancel')
  @Roles('ADMIN', 'STAFF')
  async cancelTask(@Param('id') id: string, @Body('note') note?: string) {
    return this.deliveryService.cancelTask(id, note);
  }

  // ─── Location Tracking ────────────────────────────────────────────────────

  @Post('my-location')
  @Roles('SHIPPER')
  async recordMyLocation(@CurrentUser() user: any, @Body() dto: RecordLocationDto) {
    const shipper = await this.deliveryService.getShipperByUserId(user.sub);
    return this.deliveryService.recordLocation({
      shipperId: shipper.id,
      ...dto,
    });
  }

  @Get('shippers/:id/location')
  @Roles('ADMIN', 'STAFF')
  async getShipperLocation(@Param('id') id: string) {
    return this.deliveryService.getCurrentLocation({ shipperId: id });
  }

  @Get('shippers/:id/location-history')
  @Roles('ADMIN', 'STAFF')
  async getShipperLocationHistory(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.deliveryService.getLocationHistory({
      shipperId: id,
      limit: limit ? Number(limit) : 50,
    });
  }

  // ─── Proof ──────────────────────────────────────────────────────────────

  @Post('tasks/:id/proof')
  @Roles('SHIPPER')
  async submitProof(
    @Param('id') id: string,
    @Body() dto: SubmitProofDto,
  ) {
    return this.deliveryService.submitProof({
      taskId: id,
      ...dto,
    });
  }

  @Get('tasks/:id/proof')
  async getTaskProof(@Param('id') id: string) {
    return this.deliveryService.getTaskProof(id);
  }
}
