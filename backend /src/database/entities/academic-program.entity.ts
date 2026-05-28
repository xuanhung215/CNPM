import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FacultyEntity } from './faculty.entity';

@Entity('academic_programs')
export class AcademicProgramEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  facultyId: string;

  @ManyToOne(() => FacultyEntity)
  @JoinColumn({ name: 'facultyId' })
  faculty: FacultyEntity;

  @Column()
  startYear: number;

  @Column()
  endYear: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}