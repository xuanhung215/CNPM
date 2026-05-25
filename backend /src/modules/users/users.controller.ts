import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/status.enum';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Query('role') role?: UserRole) {
    if (role) {
      const all = await this.usersService.findAll();
      return all.filter(u => u.role === role);
    }
    return this.usersService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createUser(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateUser(@Param('id') id: string, @Body() userData: any) {
    return this.usersService.update(id, userData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
