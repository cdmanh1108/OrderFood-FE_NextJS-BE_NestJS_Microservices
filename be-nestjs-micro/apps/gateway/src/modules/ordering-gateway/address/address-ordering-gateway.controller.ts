import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AddressOrderingGatewayService } from './address-ordering-gateway.service';
import { CreateAddressRequestDto } from './dto/request/create-address.request.dto';
import { ListAddressesRequestDto } from './dto/request/list-addresses.request.dto';
import { UpdateAddressRequestDto } from './dto/request/update-address.request.dto';
import { SetDefaultAddressRequestDto } from './dto/request/set-default-address.request.dto';
import { type RequestWithUser } from '@app/auth';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressOrderingGatewayController {
  constructor(
    private readonly addressOrderingGatewayService: AddressOrderingGatewayService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateAddressRequestDto,
    @Req() request: RequestWithUser,
  ) {
    const userId = this.getUserId(request);
    return this.addressOrderingGatewayService.create(userId, dto);
  }

  @Get()
  findAll(
    @Query() query: ListAddressesRequestDto,
    @Req() request: RequestWithUser,
  ) {
    const userId = this.getUserId(request);
    return this.addressOrderingGatewayService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: RequestWithUser) {
    const userId = this.getUserId(request);
    return this.addressOrderingGatewayService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressRequestDto,
    @Req() request: RequestWithUser,
  ) {
    const userId = this.getUserId(request);
    return this.addressOrderingGatewayService.update(userId, id, dto);
  }

  @Patch(':id/default')
  setDefault(
    @Param('id') id: string,
    @Body() dto: SetDefaultAddressRequestDto,
    @Req() request: RequestWithUser,
  ) {
    const userId = this.getUserId(request);
    return this.addressOrderingGatewayService.setDefault(userId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    const userId = this.getUserId(request);
    return this.addressOrderingGatewayService.remove(userId, id);
  }

  private getUserId(request: RequestWithUser): string {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException({
        code: ERRORS.UNAUTHORIZED.code,
        message: ERRORS.UNAUTHORIZED.message,
      });
    }

    return userId;
  }
}
