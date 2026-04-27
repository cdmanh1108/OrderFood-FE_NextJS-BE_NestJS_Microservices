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
  UseGuards,
} from '@nestjs/common';
import { Roles, RolesGuard, JwtAuthGuard } from '@app/auth';
import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';
import { UserGatewayService } from './user-gateway.service';
import { CreateStaffUserRequestDto } from './dto/request/create-staff-user.request.dto';
import { ListStaffUsersRequestDto } from './dto/request/list-staff-users.request.dto';
import { UpdateStaffUserRequestDto } from './dto/request/update-staff-user.request.dto';

type RequestWithAuthUser = {
  user?: {
    role?: UserRole;
  };
};

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserGatewayController {
  constructor(private readonly userGatewayService: UserGatewayService) {}


  @Post('staff')
  @Roles('ADMIN')
  createStaff(
    @Body() dto: CreateStaffUserRequestDto,
    @Req() request: RequestWithAuthUser,
  ) {
    return this.userGatewayService.createStaff({
      actorRole: request.user?.role as UserRole.ADMIN,
      email: dto.email,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
    });
  }

  @Get('staff')
  @Roles('ADMIN')
  listStaff(
    @Query() query: ListStaffUsersRequestDto,
    @Req() request: RequestWithAuthUser,
  ) {
    return this.userGatewayService.listStaff({
      actorRole: request.user?.role as UserRole.ADMIN,
      keyword: query.keyword,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('staff/:id')
  @Roles('ADMIN')
  getStaffDetail(@Param('id') id: string, @Req() request: RequestWithAuthUser) {
    return this.userGatewayService.getStaffDetail({
      actorRole: request.user?.role as UserRole.ADMIN,
      id,
    });
  }

  @Patch('staff/:id')
  @Roles('ADMIN')
  updateStaff(
    @Param('id') id: string,
    @Body() dto: UpdateStaffUserRequestDto,
    @Req() request: RequestWithAuthUser,
  ) {
    return this.userGatewayService.updateStaff({
      actorRole: request.user?.role as UserRole.ADMIN,
      id,
      email: dto.email,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
    });
  }

  @Delete('staff/:id')
  @Roles('ADMIN')
  deleteStaff(@Param('id') id: string, @Req() request: RequestWithAuthUser) {
    return this.userGatewayService.deleteStaff({
      actorRole: request.user?.role as UserRole.ADMIN,
      id,
    });
  }
}
