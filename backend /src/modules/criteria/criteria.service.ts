import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CriteriaEntity } from '../../database/entities/criteria.entity';

@Injectable()
export class CriteriaService {
  constructor(
    @InjectRepository(CriteriaEntity)
    private criteriaRepository: Repository<CriteriaEntity>,
  ) {}

  async getCriteriaTree(): Promise<any[]> {
    const allCriteria = await this.criteriaRepository.find({ order: { order: 'ASC' } });
    const roots = allCriteria.filter((c) => !c.parentId);
    
    const buildTree = (node: any) => {
      const children = allCriteria
        .filter((c) => c.parentId === node.id)
        .sort((a, b) => a.order - b.order);
      if (children.length > 0) {
        node.children = children.map((c) => buildTree({ ...c }));
      }
      return node;
    };
    
    return roots.map((r) => buildTree({ ...r }));
  }

  async getAllCriteria(): Promise<CriteriaEntity[]> {
    return this.criteriaRepository.find({ order: { order: 'ASC' } });
  }

  async updateCriteria(id: string, data: Partial<CriteriaEntity>): Promise<CriteriaEntity> {
    const criteria = await this.criteriaRepository.findOne({ where: { id } });
    if (!criteria) throw new NotFoundException('Criteria not found');
    
    Object.assign(criteria, data);
    return this.criteriaRepository.save(criteria);
  }

  async createCriteria(data: Partial<CriteriaEntity>): Promise<CriteriaEntity> {
    const newCriteria = this.criteriaRepository.create({
      ...data,
      id: data.id || `c_${Date.now()}`,
    });
    return this.criteriaRepository.save(newCriteria);
  }

  async deleteCriteria(id: string): Promise<boolean> {
    const result = await this.criteriaRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }
}
