import { Controller, Post, UseGuards, UploadedFile } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('evidence')
@UseGuards(AuthGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post('upload')
  async upload(@UploadedFile() file: any) {
    const url = await this.evidenceService.uploadEvidence(file);
    return {
      success: true,
      url,
    };
  }
}
