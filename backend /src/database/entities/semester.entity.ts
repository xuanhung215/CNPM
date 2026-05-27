import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('semesters')
export class SemesterEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  han_sv_tu_cham: Date;

  @Column()
  han_bcs_cham: Date;

  @Column()
  han_cvht_cham: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
