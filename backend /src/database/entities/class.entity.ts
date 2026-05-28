import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AcademicProgramEntity } from './academic-program.entity';
import { UserEntity } from './user.entity';

@Entity('classes')
export class ClassEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;


  @Column()
  academicProgramId: string;

  @ManyToOne(() => AcademicProgramEntity)
  @JoinColumn({ name: 'academicProgramId' })
  academicProgram: AcademicProgramEntity;

  @Column({ nullable: true })
  cvhtId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'cvhtId' })
  cvht: UserEntity;

  @Column({ default: 0 })
  capacity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}