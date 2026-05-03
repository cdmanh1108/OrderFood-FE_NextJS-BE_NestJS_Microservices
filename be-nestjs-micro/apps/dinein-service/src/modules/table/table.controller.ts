import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DINEIN_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';

import type { CreateTableCommand } from '@app/contracts/dinein/table/commands/create-table.command';
import type { UpdateTableCommand } from '@app/contracts/dinein/table/commands/update-table.command';
import type { DeleteTableCommand } from '@app/contracts/dinein/table/commands/delete-table.command';
import type { GetTableDetailQuery } from '@app/contracts/dinein/table/commands/get-table-detail.query';
import type { ListTablesQuery } from '@app/contracts/dinein/table/commands/list-tables.query';

import { TableService } from './table.service';

@Controller()
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @MessagePattern(DINEIN_PATTERNS.CREATE_TABLE)
  async createTable(
    @Payload() command: CreateTableCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.tableService.create(command));
  }

  @MessagePattern(DINEIN_PATTERNS.UPDATE_TABLE)
  async updateTable(
    @Payload() command: UpdateTableCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.tableService.update(command));
  }

  @MessagePattern(DINEIN_PATTERNS.GET_TABLE_DETAIL)
  async getTableDetail(
    @Payload() query: GetTableDetailQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.tableService.findOne(query));
  }

  @MessagePattern(DINEIN_PATTERNS.LIST_TABLES)
  async listTables(
    @Payload() query: ListTablesQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.tableService.findAll(query));
  }

  @MessagePattern(DINEIN_PATTERNS.DELETE_TABLE)
  async deleteTable(
    @Payload() command: DeleteTableCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.tableService.delete(command));
  }
}
