export enum ComplaintStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export class ComplaintEntity {
  id: string;
  studentId: string;
  gradingId: string;
  criteriaId: string;
  content: string;
  evidenceUrl?: string;
  status: ComplaintStatus;
  response?: string; // Phản hồi từ CVHT/Admin
  newScore?: number; // Điểm đề xuất hoặc điểm được cập nhật
  createdAt: Date;
  updatedAt: Date;
}
