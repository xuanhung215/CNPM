import { Injectable } from '@nestjs/common';

@Injectable()
export class EvidenceService {
  async uploadEvidence(file: any): Promise<string> {
    // Giả lập lưu file và trả về URL
    console.log('Đang tải lên file:', file?.originalname);
    return `https://res.cloudinary.com/demo/image/upload/v1715999999/evidence_${Date.now()}.png`;
  }
}
