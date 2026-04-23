import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { IAM_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/common/rmq/rpc-message.helper';
import { UserService } from './user.service';
import type { CreateStaffUserCommand } from '@app/contracts/iam/user/commands/create-staff-user.command';
import type { ListStaffUsersQuery } from '@app/contracts/iam/user/commands/list-staff-users.query';
import type { GetStaffUserDetailQuery } from '@app/contracts/iam/user/commands/get-staff-user-detail.query';
import type { UpdateStaffUserCommand } from '@app/contracts/iam/user/commands/update-staff-user.command';
import type { DeleteStaffUserCommand } from '@app/contracts/iam/user/commands/delete-staff-user.command';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(IAM_PATTERNS.CREATE_STAFF_USER)
  createStaff(
    @Payload() dto: CreateStaffUserCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.userService.createStaff(dto));
  }

  @MessagePattern(IAM_PATTERNS.LIST_STAFF_USERS)
  listStaff(@Payload() query: ListStaffUsersQuery, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.userService.listStaff(query));
  }

  @MessagePattern(IAM_PATTERNS.GET_STAFF_USER_DETAIL)
  getStaffDetail(
    @Payload() query: GetStaffUserDetailQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.userService.getStaffDetail(query),
    );
  }

  @MessagePattern(IAM_PATTERNS.UPDATE_STAFF_USER)
  updateStaff(
    @Payload() command: UpdateStaffUserCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.userService.updateStaff(command),
    );
  }

  @MessagePattern(IAM_PATTERNS.DELETE_STAFF_USER)
  deleteStaff(
    @Payload() command: DeleteStaffUserCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.userService.deleteStaff(command),
    );
  }
}
