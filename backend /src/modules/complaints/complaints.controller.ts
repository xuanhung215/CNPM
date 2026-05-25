import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('complaints')
@UseGuards(AuthGuard)
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  async getAll() {
    return this.complaintsService.getComplaints();
  }

  @Post('submit')
  async submit(
    @CurrentUser('sub') userId: string,
    @Body() body: { gradingId: string; criteriaId: string; content: string; evidenceUrl?: string },
  ) {
    return this.complaintsService.createComplaint(
      userId,
      body.gradingId,
      body.criteriaId,
      body.content,
      body.evidenceUrl,
    );
  }

  @Post('resolve/:id')
  async resolve(
    @CurrentUser('username') username: string,
    @Param('id') id: string,
    @Body() body: { action: 'ACCEPT' | 'REJECT'; response: string; newScore?: number },
  ) {
    return this.complaintsService.resolveComplaint(
      username,
      id,
      body.action,
      body.response,
      body.newScore,
    );
  }
}
