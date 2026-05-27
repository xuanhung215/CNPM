import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ComplaintStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

@Entity('complaints')
export class ComplaintEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  studentId: string;

  @Column()
  gradingId: string;

  @Column()
  criteriaId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  evidenceUrl?: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  status: ComplaintStatus;

  @Column({ nullable: true, type: 'text' })
  response?: string;

  @Column({ nullable: true })
  newScore?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
