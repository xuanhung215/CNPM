import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { GradingStatus } from '../../common/constants/status.enum';
import { UserEntity } from './user.entity';

@Entity('gradings')
export class GradingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  studentId: string;

  // Tạm thời comment để tránh lỗi FK với dữ liệu rác cũ
  // @ManyToOne(() => UserEntity)
  // @JoinColumn({ name: 'studentId' })
  // student: UserEntity;

  @Column()
  semesterId: string;

  @Column({
    type: 'enum',
    enum: GradingStatus,
    default: GradingStatus.BAN_NHAP,
  })
  status: GradingStatus;

  @Column()
  studentSumScore: number;

  @Column({ nullable: true })
  bcsSumScore?: number;

  @Column({ nullable: true })
  cvhtSumScore?: number;

  @Column({ nullable: true })
  classification?: string;

  @OneToMany(() => GradingDetailEntity, (detail) => detail.grading)
  details: GradingDetailEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('grading_details')
export class GradingDetailEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  gradingId: string;

  @Column()
  criteriaId: string;

  @Column()
  studentScore: number;

  @Column({ nullable: true })
  bcsScore?: number;

  @Column({ nullable: true, type: 'text' })
  bcsReason?: string;

  @Column({ nullable: true })
  cvhtScore?: number;

  @Column({ nullable: true, type: 'text' })
  cvhtReason?: string;

  @Column({ nullable: true })
  evidenceUrl?: string;

  @ManyToOne(() => GradingEntity, (grading) => grading.details)
  grading: GradingEntity;
}
