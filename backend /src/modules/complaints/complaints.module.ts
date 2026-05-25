import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { GradingModule } from '../grading/grading.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [GradingModule, AuditLogModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
