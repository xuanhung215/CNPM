import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { GradingService } from './grading.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DeadlineGuard } from '../../common/guards/deadline.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, GradingStatus } from '../../common/constants/status.enum';

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
  @Roles(UserRole.BCS, UserRole.CVHT, UserRole.ADMIN)
  async getByClass(
    @CurrentUser('sub') userId: string,
    @Param('classId') classId: string,
    @Query('status') status?: GradingStatus,
    @Query('minScore') minScore?: number,
    @Query('maxScore') maxScore?: number,
  ) {
    return this.gradingService.getStudentsByClass(userId, classId, { status, minScore, maxScore });
  }

  @Get('sheet/:sheetId')
  async getSheetById(
    @CurrentUser() user: any,
    @Param('sheetId') sheetId: string
  ) {
    return this.gradingService.getSheetById(sheetId, user);
  }

  @Post('submit')
  @UseGuards(DeadlineGuard)
  async submitScore(
    @CurrentUser() user: any,
    @Body() body: { studentId?: string; semesterId: string; details: any[]; isDraft?: boolean },
  ) {
    const targetStudentId = body.studentId || user.sub;
    return this.gradingService.submitGrading(
      targetStudentId,
      body.semesterId,
      body.details,
      body.isDraft || false,
      user
    );
  }

  @Get('history')
  async getHistory(@CurrentUser('sub') userId: string) {
    return this.gradingService.getStudentHistory(userId);
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
  async getOverview() {
    return this.gradingService.getStatsOverview();
  }

  @Get('stats/class/:classId')
  @Roles(UserRole.ADMIN, UserRole.CVHT)
  async getClassStats(
    @Param('classId') classId: string,
    @Query('semesterId') semesterId: string,
  ) {
    return this.gradingService.getClassStats(classId, semesterId || '20252');
  }

  @Post('batch-approve')
  @Roles(UserRole.CVHT, UserRole.ADMIN)
  async batchApprove(
    @CurrentUser('sub') userId: string,
    @Body() body: { sheetIds: string[] },
  ) {
    return this.gradingService.batchApproveByCvht(userId, body.sheetIds);
  }

  @Get('trend/:studentId')
  @Roles(UserRole.ADMIN, UserRole.CVHT, UserRole.SINHVIEN)
  async getTrend(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    if (user.role === UserRole.SINHVIEN && user.sub !== studentId) {
      throw new ForbiddenException('Bạn không có quyền xem xu hướng của người khác');
    }
    return this.gradingService.getStudentTrend(studentId);
  }

  @Get('export/excel/:classId')
  async exportExcel(@Param('classId') classId: string) {
    return this.gradingService.exportExcel(classId);
  }
}
