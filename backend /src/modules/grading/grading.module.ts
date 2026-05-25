import { Module } from '@nestjs/common';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { CriteriaModule } from '../criteria/criteria.module';
import { AcademicYearModule } from '../academic-year/academic-year.module';
import { DeadlineGuard } from '../../common/guards/deadline.guard';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CriteriaModule, AcademicYearModule, AuditLogModule, UsersModule],
  controllers: [GradingController],
  providers: [GradingService, DeadlineGuard],
  exports: [GradingService],
})
export class GradingModule {}
