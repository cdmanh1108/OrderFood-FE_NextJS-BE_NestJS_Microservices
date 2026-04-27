import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import type { CreateAddressCommand } from '@app/contracts/ordering/address/commands/create-address.command';
import type { UpdateAddressCommand } from '@app/contracts/ordering/address/commands/update-address.command';
import type { GetAddressDetailQuery } from '@app/contracts/ordering/address/commands/get-address-detail.query';
import type { ListAddressesQuery } from '@app/contracts/ordering/address/commands/list-addresses.query';
import type { SetDefaultAddressCommand } from '@app/contracts/ordering/address/commands/set-default-address.command';
import type { DeleteAddressCommand } from '@app/contracts/ordering/address/commands/delete-address.command';
import type { AddressDetailResult } from '@app/contracts/ordering/address/results/address-detail.result';
import type { PaginatedAddressesResult } from '@app/contracts/ordering/address/results/paginated-addresses.result';
import type { SetDefaultAddressResult } from '@app/contracts/ordering/address/results/set-default-address.result';
import type { DeleteAddressResult } from '@app/contracts/ordering/address/results/delete-address.result';
import { CreateAddressRequestDto } from './dto/request/create-address.request.dto';
import { UpdateAddressRequestDto } from './dto/request/update-address.request.dto';
import { ListAddressesRequestDto } from './dto/request/list-addresses.request.dto';
import { SetDefaultAddressRequestDto } from './dto/request/set-default-address.request.dto';

@Injectable()
export class AddressOrderingGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.ORDERING)
    private readonly orderingClient: ClientProxy,
  ) {}

  async create(
    userId: string,
    dto: CreateAddressRequestDto,
  ): Promise<AddressDetailResult> {
    const command: CreateAddressCommand = {
      userId,
      receiverName: dto.receiverName,
      receiverPhone: dto.receiverPhone,
      province: dto.province,
      district: dto.district,
      ward: dto.ward,
      street: dto.street,
      detail: dto.detail,
      latitude: dto.latitude,
      longitude: dto.longitude,
      isDefault: dto.isDefault,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          AddressDetailResult,
          CreateAddressCommand
        >(ORDERING_PATTERNS.CREATE_ADDRESS, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findAll(
    userId: string,
    dto: ListAddressesRequestDto,
  ): Promise<PaginatedAddressesResult> {
    const query: ListAddressesQuery = {
      userId,
      page: dto.page,
      limit: dto.limit,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          PaginatedAddressesResult,
          ListAddressesQuery
        >(ORDERING_PATTERNS.LIST_ADDRESSES, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findOne(userId: string, id: string): Promise<AddressDetailResult> {
    const query: GetAddressDetailQuery = {
      id,
      userId,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          AddressDetailResult,
          GetAddressDetailQuery
        >(ORDERING_PATTERNS.GET_ADDRESS_DETAIL, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAddressRequestDto,
  ): Promise<AddressDetailResult> {
    const command: UpdateAddressCommand = {
      id,
      userId,
      receiverName: dto.receiverName,
      receiverPhone: dto.receiverPhone,
      province: dto.province,
      district: dto.district,
      ward: dto.ward,
      street: dto.street,
      detail: dto.detail,
      latitude: dto.latitude,
      longitude: dto.longitude,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          AddressDetailResult,
          UpdateAddressCommand
        >(ORDERING_PATTERNS.UPDATE_ADDRESS, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async setDefault(
    userId: string,
    id: string,
    dto: SetDefaultAddressRequestDto,
  ): Promise<SetDefaultAddressResult> {
    if (dto.isDefault === false) {
      throw new BadRequestException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'This endpoint only supports setting default address',
      });
    }

    const command: SetDefaultAddressCommand = {
      id,
      userId,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          SetDefaultAddressResult,
          SetDefaultAddressCommand
        >(ORDERING_PATTERNS.SET_DEFAULT_ADDRESS, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async remove(userId: string, id: string): Promise<DeleteAddressResult> {
    const command: DeleteAddressCommand = {
      id,
      userId,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          DeleteAddressResult,
          DeleteAddressCommand
        >(ORDERING_PATTERNS.DELETE_ADDRESS, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
