import { Controller, Get, UseGuards } from '@nestjs/common';
import { CriteriaService } from './criteria.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('criteria')
@UseGuards(AuthGuard)
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Get('tree')
  async getTree() {
    return this.criteriaService.getCriteriaTree();
  }
}
