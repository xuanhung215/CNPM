import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriteriaController } from './criteria.controller';
import { CriteriaService } from './criteria.service';
import { CriteriaEntity } from '../../database/entities/criteria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CriteriaEntity])],
  controllers: [CriteriaController],
  providers: [CriteriaService],
  exports: [CriteriaService],
})
export class CriteriaModule {}
