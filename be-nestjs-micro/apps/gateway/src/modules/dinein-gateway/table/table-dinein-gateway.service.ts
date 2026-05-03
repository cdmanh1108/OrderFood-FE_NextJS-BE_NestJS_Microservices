import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { DINEIN_PATTERNS } from '@app/messaging/constants/patterns.constant';

import type { CreateTableCommand } from '@app/contracts/dinein/table/commands/create-table.command';
import type { UpdateTableCommand } from '@app/contracts/dinein/table/commands/update-table.command';
import type { DeleteTableCommand } from '@app/contracts/dinein/table/commands/delete-table.command';
import type { GetTableDetailQuery } from '@app/contracts/dinein/table/commands/get-table-detail.query';
import type { ListTablesQuery } from '@app/contracts/dinein/table/commands/list-tables.query';
import type { TableDetailResult } from '@app/contracts/dinein/table/results/table-detail.result';
import type { PaginatedTablesResult } from '@app/contracts/dinein/table/results/paginated-tables.result';
import type { DeleteTableResult } from '@app/contracts/dinein/table/results/delete-table.result';

import { CreateTableRequestDto } from './dto/create-table.request.dto';
import { UpdateTableRequestDto } from './dto/update-table.request.dto';
import { ListTablesRequestDto } from './dto/list-tables.request.dto';

@Injectable()
export class TableDineinGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.DINEIN)
    private readonly dineinClient: ClientProxy,
  ) {}

  async createTable(dto: CreateTableRequestDto): Promise<TableDetailResult> {
    const command: CreateTableCommand = { ...dto };
    return firstValueFrom(
      this.dineinClient
        .send<TableDetailResult, CreateTableCommand>(
          DINEIN_PATTERNS.CREATE_TABLE,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async updateTable(
    id: string,
    dto: UpdateTableRequestDto,
  ): Promise<TableDetailResult> {
    const command: UpdateTableCommand = { id, ...dto };
    return firstValueFrom(
      this.dineinClient
        .send<TableDetailResult, UpdateTableCommand>(
          DINEIN_PATTERNS.UPDATE_TABLE,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async deleteTable(id: string): Promise<DeleteTableResult> {
    const command: DeleteTableCommand = { id };
    return firstValueFrom(
      this.dineinClient
        .send<DeleteTableResult, DeleteTableCommand>(
          DINEIN_PATTERNS.DELETE_TABLE,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async getTableDetail(id: string): Promise<TableDetailResult> {
    const query: GetTableDetailQuery = { id };
    return firstValueFrom(
      this.dineinClient
        .send<TableDetailResult, GetTableDetailQuery>(
          DINEIN_PATTERNS.GET_TABLE_DETAIL,
          query,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async listTables(dto: ListTablesRequestDto): Promise<PaginatedTablesResult> {
    const query: ListTablesQuery = { ...dto };
    return firstValueFrom(
      this.dineinClient
        .send<PaginatedTablesResult, ListTablesQuery>(
          DINEIN_PATTERNS.LIST_TABLES,
          query,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
