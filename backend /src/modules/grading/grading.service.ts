import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { GradingEntity, GradingDetailEntity } from '../../database/entities/grading.entity';
import { GradingStatus } from '../../common/constants/status.enum';
import { CriteriaService } from '../criteria/criteria.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GradingService {
  private mockGradingSheets: GradingEntity[] = [];

  constructor(
    private criteriaService: CriteriaService,
    private auditLogService: AuditLogService,
    private usersService: UsersService,
  ) {
    // Thêm dữ liệu mẫu cho CVHT test
    this.mockGradingSheets.push({
      id: 'sheet_sv02_20252',
      studentId: 'sv02',
      semesterId: '20252',
      status: GradingStatus.CHO_CVHT,
      studentSumScore: 90,
      bcsSumScore: 88,
      details: [
        { id: 'd1_sv02', gradingId: 'sheet_sv02_20252', criteriaId: '1.1', studentScore: 10, bcsScore: 10 },
        { id: 'd2_sv02', gradingId: 'sheet_sv02_20252', criteriaId: '1.2', studentScore: 10, bcsScore: 8, bcsReason: 'Nộp thiếu minh chứng' },
        { id: 'd3_sv02', gradingId: 'sheet_sv02_20252', criteriaId: '2.1', studentScore: 15, bcsScore: 15 },
        { id: 'd4_sv02', gradingId: 'sheet_sv02_20252', criteriaId: '2.2', studentScore: 10, bcsScore: 10 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Kiểm tra xem phiếu điểm có bị khóa (HOAN_THANH) hay không
   */
  private checkLockStatus(sheet: GradingEntity) {
    if (sheet.status === GradingStatus.HOAN_THANH) {
      throw new ForbiddenException('Phiếu điểm này đã được khóa (HOAN_THANH). Không thể chỉnh sửa thêm trừ khi có yêu cầu khiếu nại.');
    }
  }

  async getStudentSheet(studentId: string, semesterId: string): Promise<GradingEntity> {
    let sheet = this.mockGradingSheets.find(
      (s) => s.studentId === studentId && s.semesterId === semesterId,
    );

    if (!sheet) {
      const criteria = await this.criteriaService.getAllCriteria();
      const newSheet: GradingEntity = {
        id: `sheet_${studentId}_${semesterId}`,
        studentId,
        semesterId,
        status: GradingStatus.BAN_NHAP,
        studentSumScore: 0,
        bcsSumScore: 0,
        cvhtSumScore: 0,
        classification: 'Kém',
        details: criteria.map(c => ({
          id: `detail_${c.id}_${Date.now()}`,
          gradingId: '',
          criteriaId: c.id,
          studentScore: 0,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      newSheet.details.forEach(d => d.gradingId = newSheet.id);
      this.mockGradingSheets.push(newSheet);
      sheet = newSheet;
    }

    return sheet;
  }

  async getStudentsByClass(userId: string, classId: string): Promise<any[]> {
    const user = await this.usersService.findById(userId);
    if (!user || user.classId !== classId) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách sinh viên lớp này');
    }

    const allUsers = await this.usersService.findAll();
    const studentsInClass = allUsers.filter(u => u.classId === classId);

    const result = [];
    for (const student of studentsInClass) {
      const sheet = this.mockGradingSheets.find(s => s.studentId === student.id && s.semesterId === '20252');
      if (sheet && sheet.status !== GradingStatus.BAN_NHAP) {
        result.push({
          id: sheet.id,
          studentId: student.id,
          fullName: student.fullName,
          status: sheet.status,
          studentSumScore: sheet.studentSumScore,
          bcsSumScore: sheet.bcsSumScore,
          cvhtSumScore: sheet.cvhtSumScore,
        });
      }
    }
    return result;
  }

  async submitStudentScore(
    studentId: string,
    semesterId: string,
    details: { criteriaId: string; score: number; evidenceUrl?: string }[],
    isDraft: boolean = false,
  ): Promise<GradingEntity> {
    const sheet = await this.getStudentSheet(studentId, semesterId);
    this.checkLockStatus(sheet);

    const criteriaList = await this.criteriaService.getAllCriteria();

    for (const d of details) {
      const criteria = criteriaList.find(c => c.id === d.criteriaId);
      if (criteria && d.score > criteria.maxPoints) {
        throw new BadRequestException(`Điểm số của tiêu chí ${d.criteriaId} vượt quá tối đa (${criteria.maxPoints})`);
      }
    }

    for (const d of details) {
      const match = sheet.details.find((detail) => detail.criteriaId === d.criteriaId);
      if (match) {
        match.studentScore = d.score;
        match.evidenceUrl = d.evidenceUrl;
      }
    }

    const totalScore = await this.calculateTotalScore(sheet.details, criteriaList, 'studentScore');
    sheet.studentSumScore = totalScore;
    sheet.classification = this.calculateClassification(totalScore);

    if (!isDraft) {
      sheet.status = GradingStatus.CHO_BCS;
    } else {
      sheet.status = GradingStatus.BAN_NHAP;
    }

    sheet.updatedAt = new Date();
    return sheet;
  }

  private async calculateTotalScore(
    details: GradingDetailEntity[],
    criteriaList: any[],
    scoreType: 'studentScore' | 'bcsScore' | 'cvhtScore',
    parentId?: string
  ): Promise<number> {
    const children = criteriaList.filter(c => c.parentId === parentId);
    
    if (children.length === 0) {
      const detail = details.find(d => d.criteriaId === parentId);
      return detail ? (detail[scoreType] || 0) : 0;
    }

    let sum = 0;
    for (const child of children) {
      sum += await this.calculateTotalScore(details, criteriaList, scoreType, child.id);
    }

    const currentCriteria = criteriaList.find(c => c.id === parentId);
    if (currentCriteria && sum > currentCriteria.maxPoints) {
      return currentCriteria.maxPoints;
    }

    return sum;
  }

  async reviewByBcs(
    bcsId: string,
    sheetId: string,
    details: { criteriaId: string; score: number; reason?: string }[],
  ): Promise<GradingEntity> {
    const bcs = await this.usersService.findById(bcsId);
    const sheet = this.mockGradingSheets.find((s) => s.id === sheetId);
    if (!sheet) throw new NotFoundException('Phiếu điểm không tồn tại');
    
    this.checkLockStatus(sheet);

    const student = await this.usersService.findById(sheet.studentId);
    if (!bcs || !student || bcs.classId !== student.classId) {
      throw new ForbiddenException('Bạn không có quyền chấm điểm cho sinh viên lớp khác');
    }

    const criteriaList = await this.criteriaService.getAllCriteria();

    for (const d of details) {
      const match = sheet.details.find((detail) => detail.criteriaId === d.criteriaId);
      if (match) {
        if (d.score !== match.studentScore && !d.reason) {
          throw new BadRequestException(`Tiêu chí ${d.criteriaId} bị thay đổi điểm nhưng thiếu lý do giải trình`);
        }

        if (d.score !== match.studentScore) {
          await this.auditLogService.logScoreChange(
            bcs.username,
            sheet.id,
            d.criteriaId,
            match.studentScore,
            d.score,
            d.reason || '',
          );
        }

        match.bcsScore = d.score;
        match.bcsReason = d.reason;
      }
    }

    const totalScore = await this.calculateTotalScore(sheet.details, criteriaList, 'bcsScore');
    sheet.bcsSumScore = totalScore;
    sheet.status = GradingStatus.CHO_CVHT;
    sheet.updatedAt = new Date();

    return sheet;
  }

  async getSheetById(sheetId: string): Promise<GradingEntity> {
    const sheet = this.mockGradingSheets.find(s => s.id === sheetId);
    if (!sheet) throw new NotFoundException('Phiếu điểm không tồn tại');
    return sheet;
  }

  async approveByCvht(
    cvhtId: string,
    sheetId: string,
    details: { criteriaId: string; score: number; reason?: string }[],
  ): Promise<GradingEntity> {
    const cvht = await this.usersService.findById(cvhtId);
    const sheet = this.mockGradingSheets.find((s) => s.id === sheetId);
    if (!sheet) throw new NotFoundException('Phiếu điểm không tồn tại');

    this.checkLockStatus(sheet);

    const student = await this.usersService.findById(sheet.studentId);
    if (!cvht || !student || cvht.classId !== student.classId) {
      throw new ForbiddenException('Bạn không có quyền duyệt điểm cho sinh viên lớp khác');
    }

    const criteriaList = await this.criteriaService.getAllCriteria();

    for (const d of details) {
      const match = sheet.details.find((detail) => detail.criteriaId === d.criteriaId);
      if (match) {
        // Tham chiếu điểm so sánh (ưu tiên điểm BCS, nếu không có thì lấy điểm SV)
        const referenceScore = match.bcsScore !== undefined ? match.bcsScore : match.studentScore;

        if (d.score !== referenceScore && !d.reason) {
          throw new BadRequestException(`Tiêu chí ${d.criteriaId} bị CVHT thay đổi điểm nhưng thiếu lý do giải trình`);
        }

        if (d.score !== referenceScore) {
          await this.auditLogService.logScoreChange(
            cvht.username,
            sheet.id,
            d.criteriaId,
            referenceScore,
            d.score,
            d.reason || '',
          );
        }

        match.cvhtScore = d.score;
        match.cvhtReason = d.reason;
      }
    }

    const totalScore = await this.calculateTotalScore(sheet.details, criteriaList, 'cvhtScore');
    sheet.cvhtSumScore = totalScore;
    sheet.status = GradingStatus.HOAN_THANH; // Khóa sổ điểm
    sheet.classification = this.calculateClassification(totalScore);
    sheet.updatedAt = new Date();

    await this.auditLogService.addLog(cvht.username, `Đã chốt điểm và khóa sổ phiếu điểm ${sheet.id} của sinh viên ${student.fullName}`);

    return sheet;
  }

  /**
   * Cập nhật điểm đặc biệt dành cho luồng khiếu nại
   * Bỏ qua lock HOAN_THANH
   */
  async updateScoreByComplaint(
    sheetId: string,
    criteriaId: string,
    newScore: number,
  ): Promise<GradingEntity> {
    const sheet = await this.getSheetById(sheetId);
    const criteriaList = await this.criteriaService.getAllCriteria();
    
    const detail = sheet.details.find(d => d.criteriaId === criteriaId);
    if (!detail) throw new NotFoundException('Không tìm thấy tiêu chí trong phiếu điểm');

    // Cập nhật điểm CVHT (vì đây là cấp cuối cùng)
    detail.cvhtScore = newScore;
    
    // Tính toán lại toàn bộ
    const totalScore = await this.calculateTotalScore(sheet.details, criteriaList, 'cvhtScore');
    sheet.cvhtSumScore = totalScore;
    sheet.classification = this.calculateClassification(totalScore);
    sheet.updatedAt = new Date();

    return sheet;
  }

  private calculateClassification(score: number): string {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 70) return 'Khá';
    if (score >= 50) return 'Trung bình';
    if (score >= 30) return 'Yếu';
    return 'Kém';
  }

  async getStatsOverview() {
    return {
      totalStudents: 150,
      completedSheets: 45,
      pendingBcs: 20,
      pendingCvht: 30,
      classificationStats: {
        'Xuất sắc': 5,
        'Tốt': 15,
        'Khá': 20,
        'Trung bình': 5,
        'Yếu': 0,
        'Kém': 0,
      }
    };
  }

  async exportExcel(classId: string) {
    return {
      fileName: `Bang_Diem_Ren_Luyen_${classId}.xlsx`,
      url: `https://api.example.com/exports/excel/${classId}`
    };
  }
}
