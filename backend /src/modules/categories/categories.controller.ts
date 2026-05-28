import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/status.enum';

@Controller('categories')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Faculty
  @Get('faculties')
  async getAllFaculties() {
    return this.categoriesService.findAllFaculties();
  }

  @Post('faculties')
  async createFaculty(@Body() data: any) {
    return this.categoriesService.createFaculty(data);
  }

  @Put('faculties/:id')
  async updateFaculty(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.updateFaculty(id, data);
  }

  @Delete('faculties/:id')
  async deleteFaculty(@Param('id') id: string) {
    return this.categoriesService.deleteFaculty(id);
  }

  // Academic Program
  @Get('programs')
  async getAllPrograms() {
    return this.categoriesService.findAllPrograms();
  }

  @Post('programs')
  async createProgram(@Body() data: any) {
    return this.categoriesService.createProgram(data);
  }

  @Put('programs/:id')
  async updateProgram(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.updateProgram(id, data);
  }

  @Delete('programs/:id')
  async deleteProgram(@Param('id') id: string) {
    return this.categoriesService.deleteProgram(id);
  }

  // Class
  @Get('classes')
  async getAllClasses() {
    return this.categoriesService.findAllClasses();
  }

  @Post('classes')
  async createClass(@Body() data: any) {
    return this.categoriesService.createClass(data);
  }

  @Put('classes/:id')
  async updateClass(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.updateClass(id, data);
  }

  @Delete('classes/:id')
  async deleteClass(@Param('id') id: string) {
    return this.categoriesService.deleteClass(id);
  }

  // Classroom
  @Get('classes/:classId/students')
  async getStudentsInClass(@Param('classId') classId: string) {
    return this.categoriesService.findStudentsInClass(classId);
  }

  @Post('classrooms')
  async addStudentToClass(@Body() body: { classId: string; studentId: string }) {
    return this.categoriesService.addStudentToClass(body.classId, body.studentId);
  }

  @Delete('classrooms/:id')
  async removeStudentFromClass(@Param('id') id: string) {
    return this.categoriesService.removeStudentFromClass(id);
  }
}