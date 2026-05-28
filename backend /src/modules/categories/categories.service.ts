import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyEntity } from '../../database/entities/faculty.entity';
import { AcademicProgramEntity } from '../../database/entities/academic-program.entity';
import { ClassEntity } from '../../database/entities/class.entity';
import { ClassroomEntity } from '../../database/entities/classroom.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(FacultyEntity)
    private facultyRepo: Repository<FacultyEntity>,
    @InjectRepository(AcademicProgramEntity)
    private programRepo: Repository<AcademicProgramEntity>,
    @InjectRepository(ClassEntity)
    private classRepo: Repository<ClassEntity>,
    @InjectRepository(ClassroomEntity)
    private classroomRepo: Repository<ClassroomEntity>,
    private notificationsService: NotificationsService,
  ) {}

  // Faculty CRUD
  async findAllFaculties() {
    return this.facultyRepo.find();
  }

  async createFaculty(data: Partial<FacultyEntity>) {
    const all = await this.facultyRepo.find();
    const max = all.reduce((acc, f) => {
      const match = f.id.match(/^khoa_(\d+)$/);
      return match ? Math.max(acc, parseInt(match[1])) : acc;
    }, 0);
    const id = `khoa_${(max + 1).toString().padStart(2, '0')}`;
    
    const faculty = this.facultyRepo.create({ ...data, id });
    await this.notificationsService.addNotification('Hệ thống', `Khoa mới được tạo: ${data.name}`);
    return this.facultyRepo.save(faculty);
  }

  async updateFaculty(id: string, data: Partial<FacultyEntity>) {
    await this.facultyRepo.update(id, data);
    return this.facultyRepo.findOne({ where: { id } });
  }

  async deleteFaculty(id: string) {
    return this.facultyRepo.delete(id);
  }

  // AcademicProgram CRUD
  async findAllPrograms() {
    return this.programRepo.find({ relations: { faculty: true } });
  }

  async createProgram(data: Partial<AcademicProgramEntity>) {
    const all = await this.programRepo.find();
    const max = all.reduce((acc, p) => {
      const match = p.id.match(/^prog_(\d+)$/);
      return match ? Math.max(acc, parseInt(match[1])) : acc;
    }, 0);
    const id = `prog_${(max + 1).toString().padStart(2, '0')}`;

    const program = this.programRepo.create({ ...data, id });
    return this.programRepo.save(program);
  }

  async updateProgram(id: string, data: Partial<AcademicProgramEntity>) {
    await this.programRepo.update(id, data);
    return this.programRepo.findOne({ where: { id } });
  }

  async deleteProgram(id: string) {
    return this.programRepo.delete(id);
  }

  // Class CRUD
  async findAllClasses() {
    return this.classRepo.find({ relations: { academicProgram: true, cvht: true } });
  }

  async createClass(data: Partial<ClassEntity>) {
    const all = await this.classRepo.find();
    const max = all.reduce((acc, c) => {
      const match = c.id.match(/^class_(\d+)$/);
      return match ? Math.max(acc, parseInt(match[1])) : acc;
    }, 0);
    const id = `class_${(max + 1).toString().padStart(2, '0')}`;

    const cls = this.classRepo.create({ ...data, id });
    return this.classRepo.save(cls);
  }

  async updateClass(id: string, data: Partial<ClassEntity>) {
    await this.classRepo.update(id, data);
    return this.classRepo.findOne({ where: { id } });
  }

  async deleteClass(id: string) {
    return this.classRepo.delete(id);
  }

  // Classroom CRUD (Student List in Class)
  async findStudentsInClass(classId: string) {
    return this.classroomRepo.find({
      where: { classId },
      relations: { student: true },
    });
  }

  async addStudentToClass(classId: string, studentId: string) {
    const classroom = this.classroomRepo.create({ classId, studentId });
    return this.classroomRepo.save(classroom);
  }

  async removeStudentFromClass(id: string) {
    return this.classroomRepo.delete(id);
  }
}