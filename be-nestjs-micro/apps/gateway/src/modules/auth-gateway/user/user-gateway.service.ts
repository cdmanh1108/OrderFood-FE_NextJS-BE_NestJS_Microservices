import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { IAM_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { CreateStaffUserCommand } from '@app/contracts/iam/user/commands/create-staff-user.command';
import { StaffUserDetailResult } from '@app/contracts/iam/user/results/staff-user-detail.result';
import { ListStaffUsersQuery } from '@app/contracts/iam/user/commands/list-staff-users.query';
import { PaginatedStaffUsersResult } from '@app/contracts/iam/user/results/paginated-staff-users.result';
import { GetStaffUserDetailQuery } from '@app/contracts/iam/user/commands/get-staff-user-detail.query';
import { UpdateStaffUserCommand } from '@app/contracts/iam/user/commands/update-staff-user.command';
import { DeleteStaffUserCommand } from '@app/contracts/iam/user/commands/delete-staff-user.command';
import { DeleteStaffUserResult } from '@app/contracts/iam/user/results/delete-staff-user.result';

@Injectable()
export class UserGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.IAM)
    private readonly iamClient: ClientProxy,
  ) {}

  async createStaff(
    command: CreateStaffUserCommand,
  ): Promise<StaffUserDetailResult> {
    return firstValueFrom(
      this.iamClient
        .send<
          StaffUserDetailResult,
          CreateStaffUserCommand
        >(IAM_PATTERNS.CREATE_STAFF_USER, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async listStaff(
    query: ListStaffUsersQuery,
  ): Promise<PaginatedStaffUsersResult> {
    return firstValueFrom(
      this.iamClient
        .send<
          PaginatedStaffUsersResult,
          ListStaffUsersQuery
        >(IAM_PATTERNS.LIST_STAFF_USERS, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async getStaffDetail(
    query: GetStaffUserDetailQuery,
  ): Promise<StaffUserDetailResult> {
    return firstValueFrom(
      this.iamClient
        .send<
          StaffUserDetailResult,
          GetStaffUserDetailQuery
        >(IAM_PATTERNS.GET_STAFF_USER_DETAIL, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async updateStaff(
    command: UpdateStaffUserCommand,
  ): Promise<StaffUserDetailResult> {
    return firstValueFrom(
      this.iamClient
        .send<
          StaffUserDetailResult,
          UpdateStaffUserCommand
        >(IAM_PATTERNS.UPDATE_STAFF_USER, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async deleteStaff(
    command: DeleteStaffUserCommand,
  ): Promise<DeleteStaffUserResult> {
    return firstValueFrom(
      this.iamClient
        .send<
          DeleteStaffUserResult,
          DeleteStaffUserCommand
        >(IAM_PATTERNS.DELETE_STAFF_USER, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
