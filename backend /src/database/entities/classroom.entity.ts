import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ClassEntity } from './class.entity';
import { UserEntity } from './user.entity';

@Entity('classrooms')
@Unique(['classId', 'studentId'])
export class ClassroomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  classId: string;

  @ManyToOne(() => ClassEntity)
  @JoinColumn({ name: 'classId' })
  class: ClassEntity;

  @Column()
  studentId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'studentId' })
  student: UserEntity;

  @CreateDateColumn()
  enrolledDate: Date;
}