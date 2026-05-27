import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/status.enum';

@Controller('settings')
@UseGuards(AuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAll() {
    return this.settingsService.getAllSettings();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async update(@Body() body: { key: string; value: any }) {
    return this.settingsService.updateSetting(body.key, body.value);
  }
}