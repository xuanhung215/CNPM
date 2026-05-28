import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

  @Post()
  async create(@Body() data: any) {
    return this.criteriaService.createCriteria(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.criteriaService.updateCriteria(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.criteriaService.deleteCriteria(id);
  }
}
