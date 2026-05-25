import { Injectable } from '@nestjs/common';
import { SemesterEntity } from '../../database/entities/semester.entity';

@Injectable()
export class AcademicYearService {
  private mockSemesters: SemesterEntity[] = [
    {
      id: '20251',
      name: 'Học kỳ I (2025 - 2026)',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-01-15'),
      han_sv_tu_cham: new Date('2026-01-30T23:59:59'),
      han_bcs_cham: new Date('2026-02-15T23:59:59'),
      han_cvht_cham: new Date('2026-02-28T23:59:59'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '20252',
      name: 'Học kỳ II (2025 - 2026)',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-06-15'),
      han_sv_tu_cham: new Date('2026-06-30T23:59:59'),
      han_bcs_cham: new Date('2026-07-15T23:59:59'),
      han_cvht_cham: new Date('2026-07-30T23:59:59'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async getSemesters(): Promise<SemesterEntity[]> {
    return this.mockSemesters;
  }

  async getSemesterById(id: string): Promise<SemesterEntity | undefined> {
    return this.mockSemesters.find((s) => s.id === id);
  }

  async createSemester(data: Partial<SemesterEntity>): Promise<SemesterEntity> {
    const newSemester: SemesterEntity = {
      id: data.id || `sem_${Date.now()}`,
      name: data.name!,
      startDate: new Date(data.startDate!),
      endDate: new Date(data.endDate!),
      han_sv_tu_cham: new Date(data.han_sv_tu_cham!),
      han_bcs_cham: new Date(data.han_bcs_cham!),
      han_cvht_cham: new Date(data.han_cvht_cham!),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockSemesters.push(newSemester);
    return newSemester;
  }

  async updateSemester(id: string, data: Partial<SemesterEntity>): Promise<SemesterEntity> {
    const index = this.mockSemesters.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Semester not found');
    
    const updated = { ...this.mockSemesters[index], ...data, updatedAt: new Date() };
    if (data.startDate) updated.startDate = new Date(data.startDate);
    if (data.endDate) updated.endDate = new Date(data.endDate);
    if (data.han_sv_tu_cham) updated.han_sv_tu_cham = new Date(data.han_sv_tu_cham);
    if (data.han_bcs_cham) updated.han_bcs_cham = new Date(data.han_bcs_cham);
    if (data.han_cvht_cham) updated.han_cvht_cham = new Date(data.han_cvht_cham);
    
    this.mockSemesters[index] = updated;
    return updated;
  }
}
