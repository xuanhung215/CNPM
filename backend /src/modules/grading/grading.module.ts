import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { GradingEntity, GradingDetailEntity } from '../../database/entities/grading.entity';
import { CriteriaModule } from '../criteria/criteria.module';
import { AcademicYearModule } from '../academic-year/academic-year.module';
import { DeadlineGuard } from '../../common/guards/deadline.guard';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GradingEntity, GradingDetailEntity]),
    CriteriaModule,
    AcademicYearModule,
    AuditLogModule,
    UsersModule,
    NotificationsModule,
    SettingsModule,
  ],
  controllers: [GradingController],
  providers: [GradingService, DeadlineGuard],
  exports: [GradingService],
})
export class GradingModule {}
