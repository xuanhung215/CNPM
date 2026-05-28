import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyEntity } from '../../database/entities/faculty.entity';
import { AcademicProgramEntity } from '../../database/entities/academic-program.entity';
import { ClassEntity } from '../../database/entities/class.entity';
import { ClassroomEntity } from '../../database/entities/classroom.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacultyEntity,
      AcademicProgramEntity,
      ClassEntity,
      ClassroomEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}