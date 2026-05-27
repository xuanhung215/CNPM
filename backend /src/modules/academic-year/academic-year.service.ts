import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SemesterEntity } from '../../database/entities/semester.entity';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectRepository(SemesterEntity)
    private semesterRepository: Repository<SemesterEntity>,
  ) {}

  async getSemesters(): Promise<SemesterEntity[]> {
    return this.semesterRepository.find({ order: { startDate: 'DESC' } });
  }

  async getSemesterById(id: string): Promise<SemesterEntity | null> {
    return this.semesterRepository.findOne({ where: { id } });
  }

  async createSemester(data: Partial<SemesterEntity>): Promise<SemesterEntity> {
    const newSemester = this.semesterRepository.create({
      ...data,
      id: data.id || `sem_${Date.now()}`,
    });
    return this.semesterRepository.save(newSemester);
  }

  async updateSemester(id: string, data: Partial<SemesterEntity>): Promise<SemesterEntity> {
    const semester = await this.getSemesterById(id);
    if (!semester) throw new NotFoundException('Semester not found');
    
    Object.assign(semester, data);
    return this.semesterRepository.save(semester);
  }
}
