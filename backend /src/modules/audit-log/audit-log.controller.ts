import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/status.enum';

@Controller('audit-log')
@UseGuards(AuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getLogs(
    @Query('username') username?: string,
    @Query('action') action?: string,
  ) {
    return this.auditLogService.getLogs({ username, action });
  }
}
