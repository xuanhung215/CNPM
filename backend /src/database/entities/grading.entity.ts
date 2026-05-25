import { GradingStatus } from '../../common/constants/status.enum';

export class GradingDetailEntity {
  id: string;
  gradingId: string;
  criteriaId: string;
  studentScore: number;
  bcsScore?: number;
  bcsReason?: string; // Lý do giải trình nếu BCS thay đổi điểm
  cvhtScore?: number;
  cvhtReason?: string; // Lý do giải trình nếu CVHT thay đổi điểm
  evidenceUrl?: string; // Link minh chứng ảnh hoặc PDF
}

export class GradingEntity {
  id: string;
  studentId: string;
  semesterId: string;
  status: GradingStatus;
  studentSumScore: number;
  bcsSumScore?: number;
  cvhtSumScore?: number;
  classification?: string; // Xuất sắc, Tốt, Khá, Trung bình, Yếu, Kém
  details: GradingDetailEntity[];
  createdAt: Date;
  updatedAt: Date;
}
