import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, DeleteDateColumn } from 'typeorm';

@Entity('criteria')
export class CriteriaEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  maxPoints: number;

  @Column({ nullable: true })
  parentId?: string | null;

  @ManyToOne(() => CriteriaEntity, (criteria) => criteria.children)
  parent?: CriteriaEntity | null;

  @OneToMany(() => CriteriaEntity, (criteria) => criteria.parent)
  children?: CriteriaEntity[];

  @Column()
  order: number;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
