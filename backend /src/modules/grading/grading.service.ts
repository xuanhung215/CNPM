import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GradingEntity, GradingDetailEntity } from '../../database/entities/grading.entity';
import { GradingStatus, UserRole } from '../../common/constants/status.enum';
import { CriteriaService } from '../criteria/criteria.service';
import { AcademicYearService } from '../academic-year/academic-year.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class GradingService {
  constructor(
    @InjectRepository(GradingEntity)
    private gradingRepository: Repository<GradingEntity>,
    @InjectRepository(GradingDetailEntity)
    private gradingDetailRepository: Repository<GradingDetailEntity>,
    private criteriaService: CriteriaService,
    private academicYearService: AcademicYearService,
    private auditLogService: AuditLogService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private settingsService: SettingsService,
  ) {}

  /**
   * Kiểm tra xem phiếu điểm có bị khóa (HOAN_THANH) hay không
   */
  private checkLockStatus(sheet: GradingEntity) {
    if (sheet.status === GradingStatus.HOAN_THANH) {
      throw new ForbiddenException('Phiếu điểm này đã được khóa (HOAN_THANH). Không thể chỉnh sửa thêm trừ khi có yêu cầu khiếu nại.');
    }
  }

  async getStudentSheet(studentId: string, semesterId: string): Promise<GradingEntity> {
    const sheet = await this.gradingRepository.findOne({
      where: { studentId, semesterId },
      relations: { details: true },
    });

    if (!sheet) {
      const criteria = await this.criteriaService.getAllCriteria();
      const newSheetEntity = this.gradingRepository.create({
        id: `sheet_${studentId}_${semesterId}`,
        studentId,
        semesterId,
        status: GradingStatus.BAN_NHAP,
        studentSumScore: 0,
        bcsSumScore: 0,
        cvhtSumScore: 0,
        classification: 'Kém',
      });
      const savedSheet = await this.gradingRepository.save(newSheetEntity);
      
      const details = criteria.map(c => this.gradingDetailRepository.create({
        id: `detail_${c.id}_${Date.now()}`,
        gradingId: savedSheet.id,
        criteriaId: c.id,
        studentScore: 0,
      }));
      await this.gradingDetailRepository.save(details);
      savedSheet.details = details;
      return savedSheet;
    }

    return sheet;
  }

  async getStudentsByClass(userId: string, classId: string, query?: { status?: GradingStatus; minScore?: number; maxScore?: number }): Promise<any[]> {
    const user = await this.usersService.findById(userId);
    if (!user || (user.role !== UserRole.ADMIN && user.classId !== classId)) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách sinh viên lớp này');
    }

    const studentsInClass = await this.usersService.findAll({ classId, role: UserRole.SINHVIEN });

    const result = [];
    for (const student of studentsInClass) {
      const sheet = await this.gradingRepository.findOne({
        where: { studentId: student.id, semesterId: '20252' },
      });
      
      if (sheet && sheet.status !== GradingStatus.BAN_NHAP) {
        // Lọc theo query nếu có
        if (query?.status && sheet.status !== query.status) continue;
        if (query?.minScore !== undefined && (sheet.cvhtSumScore || 0) < query.minScore) continue;
        if (query?.maxScore !== undefined && (sheet.cvhtSumScore || 0) > query.maxScore) continue;

        result.push({
          id: sheet.id,
          studentId: student.id,
          fullName: student.fullName,
          status: sheet.status,
          studentSumScore: sheet.studentSumScore || 0,
          bcsSumScore: sheet.bcsSumScore || 0,
          cvhtSumScore: sheet.cvhtSumScore || 0,
        });
      }
    }
    return result;
  }

  async submitGrading(
    studentId: string,
    semesterId: string,
    details: { criteriaId: string; score: number; evidenceUrl?: string }[],
    isDraft: boolean,
    currentUser: any,
  ): Promise<GradingEntity> {
    if (currentUser.role === UserRole.SINHVIEN && currentUser.sub !== studentId) {
      throw new ForbiddenException('Bạn chỉ có thể nộp phiếu điểm cho chính mình');
    }
    
    const sheet = await this.getStudentSheet(studentId, semesterId);
    this.checkLockStatus(sheet);

    const criteriaList = await this.criteriaService.getAllCriteria();

    for (const d of details) {
      const criteria = criteriaList.find(c => c.id === d.criteriaId);
      if (criteria) {
        if (d.score > criteria.maxPoints) {
          throw new BadRequestException(`Điểm số của tiêu chí ${d.criteriaId} vượt quá tối đa (${criteria.maxPoints})`);
        }
        
        // Check if criteria has children
        const hasChildren = criteriaList.some(c => c.parentId === d.criteriaId);
        if (hasChildren && d.score > 0) {
          throw new BadRequestException(`Không được phép chấm điểm trực tiếp cho tiêu chí cha (${d.criteriaId})`);
        }
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
    sheet.classification = await this.calculateClassification(totalScore);

    if (!isDraft) {
      sheet.status = GradingStatus.CHO_BCS;
    } else {
      sheet.status = GradingStatus.BAN_NHAP;
    }

    await this.gradingDetailRepository.save(sheet.details);
    return this.gradingRepository.save(sheet);
  }

  private async calculateTotalScore(
    details: GradingDetailEntity[],
    criteriaList: any[],
    scoreType: 'studentScore' | 'bcsScore' | 'cvhtScore',
    parentId: string | null = null,
  ): Promise<number> {
    const children = criteriaList.filter(c => c.parentId === parentId);
    
    if (children.length === 0 && parentId !== null) {
      // Base case: leaf criteria
      const detail = details.find(d => d.criteriaId === parentId);
      return detail ? (detail[scoreType] || 0) : 0;
    }

    let sum = 0;
    for (const child of children) {
      sum += await this.calculateTotalScore(details, criteriaList, scoreType, child.id);
    }

    if (parentId !== null) {
      const currentCriteria = criteriaList.find(c => c.id === parentId);
      if (currentCriteria && sum > currentCriteria.maxPoints) {
        return currentCriteria.maxPoints;
      }
    }

    return sum;
  }

  async reviewByBcs(
    bcsId: string,
    sheetId: string,
    details: { criteriaId: string; score: number; reason?: string }[],
  ): Promise<GradingEntity> {
    const bcs = await this.usersService.findById(bcsId);
    if (!bcs) throw new NotFoundException('Không tìm thấy thông tin người chấm');

    const sheet = await this.gradingRepository.findOne({
      where: { id: sheetId },
      relations: { details: true },
    });
    if (!sheet) throw new NotFoundException('Phiếu điểm không tồn tại');
    
    this.checkLockStatus(sheet);

    const student = await this.usersService.findById(sheet.studentId);
    if (!student) throw new NotFoundException('Không tìm thấy thông tin sinh viên');

    if (bcs.role !== UserRole.ADMIN && bcs.classId !== student.classId) {
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
    
    await this.notificationsService.addNotification(
      'Phiếu điểm đã được BCS duyệt',
      `Phiếu điểm học kỳ ${sheet.semesterId} của bạn đã được Ban cán sự lớp duyệt.`,
      sheet.studentId,
    );

    // Notify CVHT
    const cvht = await (await this.usersService.findAll()).find(u => u.role === UserRole.CVHT && u.classId === student.classId);
    if (cvht) {
      await this.notificationsService.addNotification(
        'Có phiếu điểm chờ duyệt',
        `Sinh viên ${student.fullName} đã được BCS duyệt phiếu điểm, đang chờ bạn phê duyệt.`,
        cvht.id,
      );
    }
    
    await this.gradingDetailRepository.save(sheet.details);
    return this.gradingRepository.save(sheet);
  }

  async getSheetById(sheetId: string, user?: any): Promise<GradingEntity> {
    const sheet = await this.gradingRepository.findOne({
      where: { id: sheetId },
      relations: { details: true },
    });
    if (!sheet) throw new NotFoundException('Phiếu điểm không tồn tại');

    // Data Ownership Check
    if (user && user.role === UserRole.SINHVIEN && user.sub !== sheet.studentId) {
      throw new ForbiddenException('Bạn không có quyền xem phiếu điểm của người khác');
    }
    
    return sheet;
  }

  async approveByCvht(
    cvhtId: string,
    sheetId: string,
    details: { criteriaId: string; score: number; reason?: string }[],
  ): Promise<GradingEntity> {
    const cvht = await this.usersService.findById(cvhtId);
    if (!cvht) throw new NotFoundException('Không tìm thấy thông tin người duyệt');

    const sheet = await this.gradingRepository.findOne({
      where: { id: sheetId },
      relations: { details: true },
    });
    if (!sheet) throw new NotFoundException('Phiếu điểm không tồn tại');

    this.checkLockStatus(sheet);

    const student = await this.usersService.findById(sheet.studentId);
    if (!student) throw new NotFoundException('Không tìm thấy thông tin sinh viên');

    if (cvht.role !== UserRole.ADMIN && cvht.classId !== student.classId) {
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
    sheet.classification = await this.calculateClassification(totalScore);

    await this.notificationsService.addNotification(
      'Phiếu điểm đã được phê duyệt',
      `Phiếu điểm học kỳ ${sheet.semesterId} của bạn đã được Cố vấn học tập phê duyệt hoàn thành. Tổng điểm: ${totalScore}`,
      sheet.studentId,
    );

    await this.auditLogService.addLog(cvht.username, `Đã chốt điểm và khóa sổ phiếu điểm ${sheet.id} của sinh viên ${student.fullName}`);

    await this.gradingDetailRepository.save(sheet.details);
    return this.gradingRepository.save(sheet);
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
    sheet.classification = await this.calculateClassification(totalScore);

    await this.gradingDetailRepository.save(sheet.details);
    return this.gradingRepository.save(sheet);
  }

  private async calculateClassification(score: number): Promise<string> {
    const thresholds = await this.settingsService.getSetting('grading_thresholds');
    
    if (thresholds && Array.isArray(thresholds)) {
      const sorted = [...thresholds].sort((a, b) => b.min - a.min);
      for (const t of sorted) {
        if (score >= t.min) return t.label;
      }
    }

    // Fallback if settings missing
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 70) return 'Khá';
    if (score >= 50) return 'Trung bình';
    if (score >= 30) return 'Yếu';
    return 'Kém';
  }

  async getStatsOverview() {
    const totalStudents = (await this.usersService.findAll()).filter(u => u.role === 'sinhvien').length;
    const completedSheets = await this.gradingRepository.count({ where: { status: GradingStatus.HOAN_THANH } });
    const pendingBcs = await this.gradingRepository.count({ where: { status: GradingStatus.CHO_BCS } });
    const pendingCvht = await this.gradingRepository.count({ where: { status: GradingStatus.CHO_CVHT } });

    return {
      totalStudents,
      completedSheets,
      pendingBcs,
      pendingCvht,
      classificationStats: {
        'Xuất sắc': await this.gradingRepository.count({ where: { classification: 'Xuất sắc' } }),
        'Tốt': await this.gradingRepository.count({ where: { classification: 'Tốt' } }),
        'Khá': await this.gradingRepository.count({ where: { classification: 'Khá' } }),
        'Trung bình': await this.gradingRepository.count({ where: { classification: 'Trung bình' } }),
        'Yếu': await this.gradingRepository.count({ where: { classification: 'Yếu' } }),
        'Kém': await this.gradingRepository.count({ where: { classification: 'Kém' } }),
      }
    };
  }

  async getClassStats(classId: string, semesterId: string) {
    const students = await this.usersService.findAll({ classId, role: UserRole.SINHVIEN });
    const sheets = await this.gradingRepository.find({
      where: { semesterId, studentId: In(students.map(s => s.id)) },
    });

    const scores = sheets.map(s => s.cvhtSumScore || 0).filter(s => s > 0);
    
    return {
      classId,
      totalStudents: students.length,
      submittedCount: sheets.length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      maxScore: scores.length > 0 ? Math.max(...scores) : 0,
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
      distribution: {
        'Xuất sắc': sheets.filter(s => s.classification === 'Xuất sắc').length,
        'Tốt': sheets.filter(s => s.classification === 'Tốt').length,
        'Khá': sheets.filter(s => s.classification === 'Khá').length,
        'Trung bình': sheets.filter(s => s.classification === 'Trung bình').length,
        'Yếu': sheets.filter(s => s.classification === 'Yếu').length,
        'Kém': sheets.filter(s => s.classification === 'Kém').length,
      }
    };
  }

  async batchApproveByCvht(
    cvhtId: string,
    sheetIds: string[],
  ): Promise<any> {
    const cvht = await this.usersService.findById(cvhtId);
    if (!cvht) throw new NotFoundException('Không tìm thấy thông tin người duyệt');

    const results: { success: number; failed: number; errors: any[] } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const sheetId of sheetIds) {
      try {
        const sheet = await this.gradingRepository.findOne({
          where: { id: sheetId },
          relations: { details: true },
        });

        if (!sheet) throw new Error(`Phiếu điểm ${sheetId} không tồn tại`);
        if (sheet.status !== GradingStatus.CHO_CVHT) throw new Error(`Phiếu điểm ${sheetId} không ở trạng thái chờ duyệt`);

        // Simple batch approve: keep BCS scores if present, else keep student scores
        const details = sheet.details.map(d => ({
          criteriaId: d.criteriaId,
          score: d.bcsScore !== undefined ? d.bcsScore : d.studentScore,
        }));

        await this.approveByCvht(cvhtId, sheetId, details);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ sheetId, error: err.message });
      }
    }

    return results;
  }

  async getImprovementSuggestions(studentId: string, semesterId: string) {
    const sheet = await this.gradingRepository.findOne({
      where: { studentId, semesterId },
      relations: { details: true },
    });

    if (!sheet) return [];

    const criteriaList = await this.criteriaService.getAllCriteria();
    const suggestions = [];

    for (const detail of sheet.details) {
      const criteria = criteriaList.find(c => c.id === detail.criteriaId);
      if (criteria && !criteriaList.some(c => c.parentId === criteria.id)) { // Leaf node
        const score = detail.cvhtScore || detail.bcsScore || detail.studentScore;
        if (score < criteria.maxPoints * 0.5) {
          suggestions.push({
            criteriaId: criteria.id,
            criteriaName: criteria.name,
            currentScore: score,
            maxPoints: criteria.maxPoints,
            suggestion: `Bạn cần tích cực hơn trong việc ${criteria.name.toLowerCase()} để cải thiện điểm số.`,
          });
        }
      }
    }

    return suggestions;
  }

  async getStudentTrend(studentId: string) {
    const sheets = await this.gradingRepository.find({
      where: { studentId },
      order: { semesterId: 'ASC' },
    });

    return sheets.map(s => ({
      semesterId: s.semesterId,
      score: s.cvhtSumScore || s.bcsSumScore || s.studentSumScore,
      classification: s.classification,
    }));
  }

  async getStudentHistory(studentId: string): Promise<any[]> {
    const sheets = await this.gradingRepository.find({
      where: { studentId },
      order: { semesterId: 'DESC' },
    });

    const result = [];
    for (const sheet of sheets) {
      const semester = await this.academicYearService.getSemesterById(sheet.semesterId);
      result.push({
        ...sheet,
        semesterName: semester ? semester.name : sheet.semesterId,
      });
    }
    
    return result;
  }

  async exportExcel(classId: string) {
    return {
      fileName: `Bang_Diem_Ren_Luyen_${classId}.xlsx`,
      url: `https://api.example.com/exports/excel/${classId}`
    };
  }
}
