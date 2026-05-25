import { Controller, Get, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/status.enum';

@Controller('academic-year')
@UseGuards(AuthGuard)
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Get('semesters')
  async getSemesters() {
    return this.academicYearService.getSemesters();
  }

  @Post('semesters')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createSemester(@Body() data: any) {
    return this.academicYearService.createSemester(data);
  }

  @Put('semesters/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateSemester(@Param('id') id: string, @Body() data: any) {
    return this.academicYearService.updateSemester(id, data);
  }
}
