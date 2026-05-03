import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '@app/auth';
import { TableDineinGatewayService } from './table-dinein-gateway.service';
import { CreateTableRequestDto } from './dto/create-table.request.dto';
import { UpdateTableRequestDto } from './dto/update-table.request.dto';
import { ListTablesRequestDto } from './dto/list-tables.request.dto';

@Controller('dinein/tables')
export class TableDineinGatewayController {
  constructor(private readonly tableService: TableDineinGatewayService) {}

  @Get()
  async listTables(@Query() dto: ListTablesRequestDto) {
    return this.tableService.listTables(dto);
  }

  @Get(':id')
  async getTableDetail(@Param('id') id: string) {
    return this.tableService.getTableDetail(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async createTable(@Body() dto: CreateTableRequestDto) {
    return this.tableService.createTable(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async updateTable(
    @Param('id') id: string,
    @Body() dto: UpdateTableRequestDto,
  ) {
    return this.tableService.updateTable(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteTable(@Param('id') id: string) {
    return this.tableService.deleteTable(id);
  }
}
