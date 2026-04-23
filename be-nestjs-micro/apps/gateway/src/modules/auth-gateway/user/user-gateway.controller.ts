import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';
import { ERRORS } from '@app/common/constants/error-code.constant';
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
@UseGuards(JwtAuthGuard)
export class UserGatewayController {
  constructor(private readonly userGatewayService: UserGatewayService) {}

  private ensureAdmin(role?: UserRole): UserRole.ADMIN {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException({
        code: ERRORS.FORBIDDEN.code,
        message: ERRORS.FORBIDDEN.message,
      });
    }

    return role;
  }

  @Post('staff')
  createStaff(
    @Body() dto: CreateStaffUserRequestDto,
    @Req() request: RequestWithAuthUser,
  ) {
    const actorRole = this.ensureAdmin(request.user?.role);

    return this.userGatewayService.createStaff({
      actorRole,
      email: dto.email,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
    });
  }

  @Get('staff')
  listStaff(
    @Query() query: ListStaffUsersRequestDto,
    @Req() request: RequestWithAuthUser,
  ) {
    const actorRole = this.ensureAdmin(request.user?.role);

    return this.userGatewayService.listStaff({
      actorRole,
      keyword: query.keyword,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('staff/:id')
  getStaffDetail(@Param('id') id: string, @Req() request: RequestWithAuthUser) {
    const actorRole = this.ensureAdmin(request.user?.role);

    return this.userGatewayService.getStaffDetail({
      actorRole,
      id,
    });
  }

  @Patch('staff/:id')
  updateStaff(
    @Param('id') id: string,
    @Body() dto: UpdateStaffUserRequestDto,
    @Req() request: RequestWithAuthUser,
  ) {
    const actorRole = this.ensureAdmin(request.user?.role);

    return this.userGatewayService.updateStaff({
      actorRole,
      id,
      email: dto.email,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
    });
  }

  @Delete('staff/:id')
  deleteStaff(@Param('id') id: string, @Req() request: RequestWithAuthUser) {
    const actorRole = this.ensureAdmin(request.user?.role);

    return this.userGatewayService.deleteStaff({
      actorRole,
      id,
    });
  }
}
