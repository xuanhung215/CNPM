import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { UserEntity } from '../database/entities/user.entity';
import { SemesterEntity } from '../database/entities/semester.entity';
import { CriteriaEntity } from '../database/entities/criteria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SemesterEntity, CriteriaEntity]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}