import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { GradingService } from './grading.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DeadlineGuard } from '../../common/guards/deadline.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/status.enum';

@Controller('grading')
@UseGuards(AuthGuard, RolesGuard)
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Get('my-sheet')
  async getMySheet(
    @CurrentUser('sub') userId: string,
    @Query('semesterId') semesterId: string,
  ) {
    return this.gradingService.getStudentSheet(userId, semesterId || '20252');
  }

  @Get('class/:classId')
  async getByClass(
    @CurrentUser('sub') userId: string,
    @Param('classId') classId: string,
  ) {
    return this.gradingService.getStudentsByClass(userId, classId);
  }

  @Get('sheet/:sheetId')
  async getSheetById(@Param('sheetId') sheetId: string) {
    return this.gradingService.getSheetById(sheetId);
  }

  @Post('submit')
  @UseGuards(DeadlineGuard)
  async submitScore(
    @CurrentUser('sub') userId: string,
    @Body() body: { semesterId: string; details: any[]; isDraft?: boolean },
  ) {
    return this.gradingService.submitStudentScore(
      userId,
      body.semesterId,
      body.details,
      body.isDraft,
    );
  }

  @Post('bcs-review/:sheetId')
  async bcsReview(
    @CurrentUser('sub') userId: string,
    @Param('sheetId') sheetId: string,
    @Body() body: { details: any[] },
  ) {
    return this.gradingService.reviewByBcs(userId, sheetId, body.details);
  }

  @Post('cvht-approve/:sheetId')
  async cvhtApprove(
    @CurrentUser('sub') userId: string,
    @Param('sheetId') sheetId: string,
    @Body() body: { details: any[] },
  ) {
    return this.gradingService.approveByCvht(userId, sheetId, body.details);
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN)
  async getStatsOverview() {
    return this.gradingService.getStatsOverview();
  }

  @Get('export/excel/:classId')
  async exportExcel(@Param('classId') classId: string) {
    return this.gradingService.exportExcel(classId);
  }
}
