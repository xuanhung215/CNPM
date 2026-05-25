import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ComplaintEntity, ComplaintStatus } from '../../database/entities/complaint.entity';
import { GradingService } from '../grading/grading.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ComplaintsService {
  private mockComplaints: ComplaintEntity[] = [];

  constructor(
    private gradingService: GradingService,
    private auditLogService: AuditLogService,
  ) {}

  async getComplaints() {
    return this.mockComplaints;
  }

  async createComplaint(
    studentId: string,
    gradingId: string,
    criteriaId: string,
    content: string,
    evidenceUrl?: string,
  ) {
    const sheet = await this.gradingService.getSheetById(gradingId);
    
    // 1. Kiểm tra trạng thái phiếu (Phải là HOAN_THANH mới được khiếu nại)
    if (sheet.status !== 'HOAN_THANH') {
      throw new BadRequestException('Chỉ có thể khiếu nại sau khi phiếu điểm đã được chốt hoàn thành.');
    }

    // 2. Kiểm tra thời hạn khiếu nại (7 ngày kể từ ngày chốt điểm)
    const now = new Date();
    const lockDate = new Date(sheet.updatedAt);
    const diffDays = Math.ceil((now.getTime() - lockDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays > 7) {
      throw new ForbiddenException('Đã quá thời hạn 7 ngày để gửi khiếu nại cho phiếu điểm này.');
    }

    const complaint: ComplaintEntity = {
      id: `c_${Date.now()}`,
      studentId,
      gradingId,
      criteriaId,
      content,
      evidenceUrl,
      status: ComplaintStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.mockComplaints.push(complaint);
    return complaint;
  }

  async resolveComplaint(
    handlerUsername: string,
    complaintId: string,
    action: 'ACCEPT' | 'REJECT',
    response: string,
    newScore?: number,
  ) {
    const complaint = this.mockComplaints.find(c => c.id === complaintId);
    if (!complaint) throw new NotFoundException('Không tìm thấy đơn khiếu nại');
    if (complaint.status !== ComplaintStatus.PENDING) {
      throw new BadRequestException('Đơn khiếu nại này đã được xử lý.');
    }

    if (action === 'ACCEPT') {
      if (newScore === undefined) throw new BadRequestException('Phải cung cấp điểm số mới khi chấp nhận khiếu nại');
      
      // Database Transaction - Giả lập
      try {
        // 1. Cập nhật trạng thái đơn
        complaint.status = ComplaintStatus.RESOLVED;
        complaint.response = response;
        complaint.newScore = newScore;
        complaint.updatedAt = new Date();

        // 2 & 3. Cập nhật điểm và tính toán lại tổng điểm
        await this.gradingService.updateScoreByComplaint(
          complaint.gradingId,
          complaint.criteriaId,
          newScore,
        );

        await this.auditLogService.addLog(
          handlerUsername,
          `Phê duyệt khiếu nại ${complaintId}: Cập nhật điểm tiêu chí ${complaint.criteriaId} thành ${newScore}`,
        );
      } catch (error) {
        // Rollback nếu có lỗi (trong thực tế)
        complaint.status = ComplaintStatus.PENDING;
        throw error;
      }
    } else {
      complaint.status = ComplaintStatus.REJECTED;
      complaint.response = response;
      complaint.updatedAt = new Date();
      
      await this.auditLogService.addLog(
        handlerUsername,
        `Từ chối khiếu nại ${complaintId}. Lý do: ${response}`,
      );
    }

    return complaint;
  }
}
