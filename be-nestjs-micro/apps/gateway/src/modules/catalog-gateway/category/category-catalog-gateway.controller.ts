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
import { CategoryCatalogGatewayService } from './category-catalog-gateway.service';
import { CreateCategoryRequestDto } from './dto/request/create-category.request.dto';
import { ListCategoriesRequestDto } from './dto/request/list-categories.request.dto';
import { UpdateCategoryRequestDto } from './dto/request/update-category.request.dto';
import { SetCategoryActiveRequestDto } from './dto/request/set-category-active.request.dto';

@Controller('category')
export class CategoryCatalogGatewayController {
  constructor(
    private readonly categoryCatalogService: CategoryCatalogGatewayService,
  ) {}

  @Post()
  create(@Body() dto: CreateCategoryRequestDto) {
    return this.categoryCatalogService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListCategoriesRequestDto) {
    return this.categoryCatalogService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryCatalogService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryRequestDto) {
    return this.categoryCatalogService.update(id, dto);
  }

  @Patch(':id/active')
  setActive(
    @Param('id') id: string,
    @Body() dto: SetCategoryActiveRequestDto,
  ) {
    return this.categoryCatalogService.setActive(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryCatalogService.remove(id);
  }
}
