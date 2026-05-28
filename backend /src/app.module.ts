import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { CriteriaModule } from './modules/criteria/criteria.module';
import { GradingModule } from './modules/grading/grading.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SeedModule } from './modules/seed.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CategoriesModule } from './modules/categories/categories.module';
import configuration from './config/configuration';
import { UserEntity } from './database/entities/user.entity';
import { SemesterEntity } from './database/entities/semester.entity';
import { CriteriaEntity } from './database/entities/criteria.entity';
import { GradingEntity, GradingDetailEntity } from './database/entities/grading.entity';
import { ComplaintEntity } from './database/entities/complaint.entity';
import { NotificationEntity } from './database/entities/notification.entity';
import { SystemSettingEntity } from './database/entities/system-setting.entity';
import { AuditLogEntity } from './database/entities/audit-log.entity';
import { FacultyEntity } from './database/entities/faculty.entity';
import { AcademicProgramEntity } from './database/entities/academic-program.entity';
import { ClassEntity } from './database/entities/class.entity';
import { ClassroomEntity } from './database/entities/classroom.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [
          UserEntity,
          SemesterEntity,
          CriteriaEntity,
          GradingEntity,
          GradingDetailEntity,
          ComplaintEntity,
          NotificationEntity,
          SystemSettingEntity,
          AuditLogEntity,
          FacultyEntity,
          AcademicProgramEntity,
          ClassEntity,
          ClassroomEntity,
        ],
        synchronize: true,
        ssl: configService.get<string>('database.url')?.includes('neon.tech') 
          ? { rejectUnauthorized: false } 
          : false,
      }),
      inject: [ConfigService],
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
    SeedModule,
    SettingsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
