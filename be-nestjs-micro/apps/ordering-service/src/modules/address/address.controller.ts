import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';
import type { CreateAddressCommand } from '@app/contracts/ordering/address/commands/create-address.command';
import type { UpdateAddressCommand } from '@app/contracts/ordering/address/commands/update-address.command';
import type { GetAddressDetailQuery } from '@app/contracts/ordering/address/commands/get-address-detail.query';
import type { ListAddressesQuery } from '@app/contracts/ordering/address/commands/list-addresses.query';
import type { SetDefaultAddressCommand } from '@app/contracts/ordering/address/commands/set-default-address.command';
import type { DeleteAddressCommand } from '@app/contracts/ordering/address/commands/delete-address.command';
import { AddressService } from './address.service';

@Controller()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @MessagePattern(ORDERING_PATTERNS.CREATE_ADDRESS)
  create(@Payload() command: CreateAddressCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.addressService.create(command));
  }

  @MessagePattern(ORDERING_PATTERNS.UPDATE_ADDRESS)
  update(@Payload() command: UpdateAddressCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.addressService.update(command));
  }

  @MessagePattern(ORDERING_PATTERNS.GET_ADDRESS_DETAIL)
  findOne(@Payload() query: GetAddressDetailQuery, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.addressService.findOne(query));
  }

  @MessagePattern(ORDERING_PATTERNS.LIST_ADDRESSES)
  findAll(@Payload() query: ListAddressesQuery, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.addressService.findAll(query));
  }

  @MessagePattern(ORDERING_PATTERNS.SET_DEFAULT_ADDRESS)
  setDefault(
    @Payload() command: SetDefaultAddressCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.addressService.setDefault(command),
    );
  }

  @MessagePattern(ORDERING_PATTERNS.DELETE_ADDRESS)
  remove(@Payload() command: DeleteAddressCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.addressService.remove(command));
  }
}
