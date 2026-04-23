import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MenuItemCatalogGatewayService } from './menu-item-catalog-gateway.service';
import { CreateMenuItemRequestDto } from './dto/request/create-menu-item.request.dto';
import { ListMenuItemsRequestDto } from './dto/request/list-menu-items.request.dto';
import { UpdateMenuItemRequestDto } from './dto/request/update-menu-item.request.dto';
import { SetMenuItemActiveRequestDto } from './dto/request/set-menu-item-active.request.dto';

@Controller('menu-items')
export class MenuItemCatalogGatewayController {
  constructor(
    private readonly menuItemCatalogGatewayService: MenuItemCatalogGatewayService,
  ) {}

  @Post()
  create(@Body() dto: CreateMenuItemRequestDto) {
    return this.menuItemCatalogGatewayService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListMenuItemsRequestDto) {
    return this.menuItemCatalogGatewayService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemCatalogGatewayService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemRequestDto) {
    return this.menuItemCatalogGatewayService.update(id, dto);
  }

  @Patch(':id/active')
  setActive(
    @Param('id') id: string,
    @Body() dto: SetMenuItemActiveRequestDto,
  ) {
    return this.menuItemCatalogGatewayService.setActive(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuItemCatalogGatewayService.remove(id);
  }
}
