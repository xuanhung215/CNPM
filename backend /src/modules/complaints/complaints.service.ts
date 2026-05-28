import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintEntity, ComplaintStatus } from '../../database/entities/complaint.entity';
import { GradingService } from '../grading/grading.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/constants/status.enum';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(ComplaintEntity)
    private complaintsRepository: Repository<ComplaintEntity>,
    private gradingService: GradingService,
    private auditLogService: AuditLogService,
    private notificationsService: NotificationsService,
    private settingsService: SettingsService,
    private usersService: UsersService,
  ) {}

  async getComplaints() {
    return this.complaintsRepository.find();
  }

  async createComplaint(
    studentId: string,
    gradingId: string,
    criteriaId: string,
    content: string,
    evidenceUrl?: string,
    currentUser?: any,
  ) {
    if (currentUser && currentUser.role === UserRole.SINHVIEN && currentUser.sub !== studentId) {
      throw new ForbiddenException('Bạn chỉ có thể gửi khiếu nại cho chính mình');
    }

    const sheet = await this.gradingService.getSheetById(gradingId, currentUser);
    if (!sheet) throw new NotFoundException('Không tìm thấy phiếu điểm');
    
    // 1. Kiểm tra trạng thái phiếu (Phải là HOAN_THANH mới được khiếu nại)
    if (sheet.status !== 'HOAN_THANH') {
      throw new BadRequestException('Chỉ có thể khiếu nại sau khi phiếu điểm đã được chốt hoàn thành.');
    }

    // 2. Kiểm tra thời hạn khiếu nại
    const now = new Date();
    const updatedAt = sheet.updatedAt ? new Date(sheet.updatedAt) : now;
    const diffDays = Math.ceil((now.getTime() - updatedAt.getTime()) / (1000 * 3600 * 24));
    
    const windowDaysStr = await this.settingsService.getSetting('complaint_window_days');
    const windowDays = parseInt(windowDaysStr || '7', 10);

    if (diffDays > windowDays) {
      throw new ForbiddenException(`Đã quá thời hạn ${windowDays} ngày để gửi khiếu nại cho phiếu điểm này.`);
    }

    const complaint = this.complaintsRepository.create({
      id: `c_${Date.now()}`,
      studentId,
      gradingId,
      criteriaId,
      content,
      evidenceUrl,
      status: ComplaintStatus.PENDING,
    });
    
    const savedComplaint = await this.complaintsRepository.save(complaint);
    
    // Thông báo cho admin/cvht/bcs về khiếu nại mới
    const student = await this.usersService.findById(studentId);
    const allUsers = await this.usersService.findAll();
    const notifyUsers = allUsers.filter(u => 
      u.role === UserRole.ADMIN || 
      u.role === UserRole.CVHT || 
      (student?.classId && u.role === UserRole.BCS && u.classId === student.classId)
    );
    
    for (const notifyUser of notifyUsers) {
      await this.notificationsService.addNotification(
        student?.fullName || 'Sinh viên',
        `gửi khiếu nại về tiêu chí ${criteriaId}`,
        notifyUser.id,
      );
    }
    
    return savedComplaint;
  }

  async resolveComplaint(
    handlerUser: any,
    complaintId: string,
    action: 'ACCEPT' | 'REJECT',
    response: string,
    newScore?: number,
  ) {
    const complaint = await this.complaintsRepository.findOne({ where: { id: complaintId } });
    if (!complaint) throw new NotFoundException('Không tìm thấy đơn khiếu nại');
    if (complaint.status !== ComplaintStatus.PENDING) {
      throw new BadRequestException('Đơn khiếu nại này đã được xử lý.');
    }

    const handler = await this.usersService.findById(handlerUser.sub);
    const handlerName = handler?.fullName || handlerUser.username;

    if (action === 'ACCEPT') {
      if (newScore === undefined) throw new BadRequestException('Phải cung cấp điểm số mới khi chấp nhận khiếu nại');
      
      complaint.status = ComplaintStatus.RESOLVED;
      complaint.response = response;
      complaint.newScore = newScore;

      await this.gradingService.updateScoreByComplaint(
        complaint.gradingId,
        complaint.criteriaId,
        newScore,
      );

      await this.auditLogService.addLog(
        handlerUser.username,
        `Phê duyệt khiếu nại ${complaintId}: Cập nhật điểm tiêu chí ${complaint.criteriaId} thành ${newScore}`,
      );

      await this.notificationsService.addNotification(
        handlerName,
        `chấp nhận khiếu nại và cập nhật điểm tiêu chí ${complaint.criteriaId} thành ${newScore}`,
        complaint.studentId,
      );
    } else {
      complaint.status = ComplaintStatus.REJECTED;
      complaint.response = response;

      await this.auditLogService.addLog(
        handlerUser.username,
        `Từ chối khiếu nại ${complaintId}. Lý do: ${response}`,
      );

      await this.notificationsService.addNotification(
        handlerName,
        `từ chối khiếu nại về tiêu chí ${complaint.criteriaId}. Lý do: ${response}`,
        complaint.studentId,
      );
    }

    return this.complaintsRepository.save(complaint);
  }
}
