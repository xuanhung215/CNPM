import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/status.enum';
import { UserEntity } from '../../database/entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CVHT)
  async getAll(
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('classId') classId?: string,
  ) {
    return this.usersService.findAll({ search, role, classId });
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createUser(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Put(':id/assign-class')
  @Roles(UserRole.ADMIN, UserRole.CVHT)
  async assignClass(
    @Param('id') id: string,
    @Body('classId') classId: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.assignToClass(id, classId, user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() userData: Partial<UserEntity>) {
    return this.usersService.update(id, userData);
  }

  @Post('change-password')
  async changePassword(@CurrentUser('sub') userId: string, @Body('newPassword') newPassword: string) {
    return this.usersService.changePassword(userId, newPassword);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
