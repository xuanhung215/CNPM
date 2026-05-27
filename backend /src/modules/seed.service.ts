import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../database/entities/user.entity';
import { SemesterEntity } from '../database/entities/semester.entity';
import { CriteriaEntity } from '../database/entities/criteria.entity';
import { UserRole } from '../common/constants/status.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(SemesterEntity)
    private semesterRepository: Repository<SemesterEntity>,
    @InjectRepository(CriteriaEntity)
    private criteriaRepository: Repository<CriteriaEntity>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.seedSemesters();
    await this.seedCriteria();
  }

  async seedUsers() {
    const count = await this.userRepository.count();
    if (count > 0) return;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('123', salt);

    const users = [
      { id: 'admin', username: 'admin', email: 'admin@school.edu.vn', fullName: 'Quản trị viên', role: UserRole.ADMIN, password: await bcrypt.hash('adminpassword', salt) },
      { id: 'cvht01', username: 'cvht01', email: 'cvht01@school.edu.vn', fullName: 'Cố vấn học tập 1', role: UserRole.CVHT, classId: 'CNPM-K45-A', password: hashedPassword },
      { id: 'bcs01', username: 'bcs01', email: 'bcs01@school.edu.vn', fullName: 'Lớp trưởng A', role: UserRole.BCS, classId: 'CNPM-K45-A', password: hashedPassword },
      { id: 'sv01', username: 'sv01', email: 'sv01@school.edu.vn', fullName: 'Nguyễn Văn A', role: UserRole.SINHVIEN, classId: 'CNPM-K45-A', password: hashedPassword },
      { id: 'sv02', username: 'sv02', email: 'sv02@school.edu.vn', fullName: 'Trần Thị B', role: UserRole.SINHVIEN, classId: 'CNPM-K45-A', password: hashedPassword },
    ];

    await this.userRepository.save(this.userRepository.create(users));
    console.log('Seeded users with hashed passwords');
  }

  async seedSemesters() {
    const count = await this.semesterRepository.count();
    if (count > 0) return;

    const semesters = [
      {
        id: '20251',
        name: 'Học kỳ I (2025 - 2026)',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-01-15'),
        han_sv_tu_cham: new Date('2026-01-30T23:59:59'),
        han_bcs_cham: new Date('2026-02-15T23:59:59'),
        han_cvht_cham: new Date('2026-02-28T23:59:59'),
      },
      {
        id: '20252',
        name: 'Học kỳ II (2025 - 2026)',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-06-15'),
        han_sv_tu_cham: new Date('2026-06-30T23:59:59'),
        han_bcs_cham: new Date('2026-07-15T23:59:59'),
        han_cvht_cham: new Date('2026-07-30T23:59:59'),
      },
    ];

    await this.semesterRepository.save(this.semesterRepository.create(semesters));
    console.log('Seeded semesters');
  }

  async seedCriteria() {
    const count = await this.criteriaRepository.count();
    if (count > 0) return;

    const criteria = [
      // Tiêu chí 1
      { id: '1', name: 'Tiêu chí 1. Đánh giá về ý thức tham gia học tập', maxPoints: 20, parentId: null, order: 1 },
      { id: '1.1', name: 'Ý thức và thái độ trong học tập', maxPoints: 3, parentId: '1', order: 1 },
      { id: '1.2', name: 'Kết quả học tập trong kỳ học', maxPoints: 10, parentId: '1', order: 2 },
      { id: '1.3', name: 'Ý thức chấp hành tốt nội quy về các kỳ thi', maxPoints: 4, parentId: '1', order: 3 },
      { id: '1.4', name: 'Ý thức và thái độ tham gia các hoạt động ngoại khóa', maxPoints: 2, parentId: '1', order: 4 },
      { id: '1.5', name: 'Tinh thần vượt khó, phấn đấu vươn lên', maxPoints: 1, parentId: '1', order: 5 },

      // Tiêu chí 2
      { id: '2', name: 'Tiêu chí 2. Đánh giá về ý thức chấp hành nội quy', maxPoints: 25, parentId: null, order: 2 },
      { id: '2.1', name: 'Thực hiện nghiêm túc các nội quy, quy chế', maxPoints: 15, parentId: '2', order: 1 },
      { id: '2.2', name: 'Thực hiện nghiêm túc các buổi họp lớp', maxPoints: 5, parentId: '2', order: 2 },
      { id: '2.3', name: 'Tham gia các buổi hội thảo việc làm', maxPoints: 5, parentId: '2', order: 3 },

      // Tiêu chí 3
      { id: '3', name: 'Tiêu chí 3. Hoạt động chính trị - xã hội', maxPoints: 20, parentId: null, order: 3 },
      { id: '3.1', name: 'Tham gia đầy đủ các hoạt động chính trị', maxPoints: 10, parentId: '3', order: 1 },
      { id: '3.2', name: 'Tham gia công tác xã hội', maxPoints: 4, parentId: '3', order: 2 },
      { id: '3.3', name: 'Tuyên truyền tích cực hình ảnh về Trường', maxPoints: 3, parentId: '3', order: 3 },
      { id: '3.4', name: 'Tích cực tham gia các hoạt động phòng chống tội phạm', maxPoints: 3, parentId: '3', order: 4 },

      // Tiêu chí 4
      { id: '4', name: 'Tiêu chí 4. Đánh giá về ý thức công dân', maxPoints: 25, parentId: null, order: 4 },
      { id: '4.1', name: 'Chấp hành nghiêm chỉnh chủ trương của Đảng', maxPoints: 8, parentId: '4', order: 1 },
      { id: '4.2', name: 'Tích cực tham gia tuyên truyền chủ trương của Đảng', maxPoints: 5, parentId: '4', order: 2 },
      { id: '4.3', name: 'Có mối quan hệ đúng mực với Thầy/Cô', maxPoints: 5, parentId: '4', order: 3 },
      { id: '4.4', name: 'Có mối quan hệ tốt với bạn bè', maxPoints: 5, parentId: '4', order: 4 },
      { id: '4.5', name: 'Được biểu dương khen thưởng', maxPoints: 2, parentId: '4', order: 5 },

      // Tiêu chí 5
      { id: '5', name: 'Tiêu chí 5. Đánh giá về ý thức tham gia phụ trách lớp', maxPoints: 10, parentId: null, order: 5 },
      { id: '5.1', name: 'Sinh viên được Học viện phân công làm lớp trưởng', maxPoints: 4, parentId: '5', order: 1 },
      { id: '5.2', name: 'Thành viên tham gia các CLB', maxPoints: 3, parentId: '5', order: 2 },
      { id: '5.3', name: 'Sinh viên đạt thành tích đặc biệt', maxPoints: 3, parentId: '5', order: 3 },
    ];

    await this.criteriaRepository.save(this.criteriaRepository.create(criteria));
    console.log('Seeded criteria');
  }
}