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
    @CurrentUser() user: any,
    @Body() body: { gradingId: string; criteriaId: string; content: string; evidenceUrl?: string },
  ) {
    return this.complaintsService.createComplaint(
      user.sub,
      body.gradingId,
      body.criteriaId,
      body.content,
      body.evidenceUrl,
      user,
    );
  }

  @Post('resolve/:id')
  async resolve(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'ACCEPT' | 'REJECT'; response: string; newScore?: number },
  ) {
    return this.complaintsService.resolveComplaint(
      user,
      id,
      body.action,
      body.response,
      body.newScore,
    );
  }
}
