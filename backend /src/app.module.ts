import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { CriteriaModule } from './modules/criteria/criteria.module';
import { GradingModule } from './modules/grading/grading.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    UsersModule,
    AcademicYearModule,
    CriteriaModule,
    GradingModule,
    EvidenceModule,
    ComplaintsModule,
    AuditLogModule,
    NotificationsModule,
  ],
})
export class AppModule {}
