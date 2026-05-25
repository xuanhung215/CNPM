import { Injectable } from '@nestjs/common';
import { CriteriaEntity } from '../../database/entities/criteria.entity';

@Injectable()
export class CriteriaService {
  private mockCriteria: CriteriaEntity[] = [
    // Tiêu chí 1: Đánh giá về ý thức tham gia học tập (20 điểm)
    { id: '1', name: 'Tiêu chí 1. Đánh giá về ý thức tham gia học tập', maxPoints: 20, parentId: null, order: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: '1.1', name: 'Ý thức và thái độ trong học tập (Đi học đầy đủ, đúng giờ, nghiêm túc trong giờ học...)', maxPoints: 3, parentId: '1', order: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: '1.2', name: 'Kết quả học tập trong kỳ học (Xếp loại học tập: Xuất sắc 10đ, Giỏi 8đ, Khá 6đ, TB 4đ...)', maxPoints: 10, parentId: '1', order: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: '1.3', name: 'Ý thức chấp hành tốt nội quy về các kỳ thi', maxPoints: 4, parentId: '1', order: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: '1.4', name: 'Ý thức và thái độ tham gia các hoạt động ngoại khóa, nghiên cứu khoa học, CLB...', maxPoints: 2, parentId: '1', order: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: '1.5', name: 'Tinh thần vượt khó, phấn đấu vươn lên trong học tập', maxPoints: 1, parentId: '1', order: 5, createdAt: new Date(), updatedAt: new Date() },

    // Tiêu chí 2: Ý thức chấp hành nội quy, quy chế (25 điểm)
    { id: '2', name: 'Tiêu chí 2. Đánh giá về ý thức chấp hành nội quy, quy chế, quy định của Học viện', maxPoints: 25, parentId: null, order: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: '2.1', name: 'Thực hiện nghiêm túc các nội quy, quy chế, các quy định hiện hành trong Học viện', maxPoints: 15, parentId: '2', order: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: '2.2', name: 'Thực hiện nghiệp túc các buổi họp lớp, sinh hoạt đoàn thể do Học viện/Khoa/Lớp tổ chức', maxPoints: 5, parentId: '2', order: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: '2.3', name: 'Tham gia các buổi hội thảo việc làm, định hướng nghề nghiệp do Học viện tổ chức', maxPoints: 5, parentId: '2', order: 3, createdAt: new Date(), updatedAt: new Date() },

    // Tiêu chí 3: Hoạt động chính trị - xã hội (20 điểm)
    { id: '3', name: 'Tiêu chí 3. Đánh giá về ý thức và kết quả tham gia hoạt động chính trị - xã hội, văn hóa, văn nghệ, thể thao...', maxPoints: 20, parentId: null, order: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: '3.1', name: 'Tham gia đầy đủ các hoạt động chính trị, xã hội, văn hóa, văn nghệ, tình nguyện...', maxPoints: 10, parentId: '3', order: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: '3.2', name: 'Tham gia công tác xã hội: hiến máu nhân đạo, ủng hộ người nghèo, thiên tai lũ lụt...', maxPoints: 4, parentId: '3', order: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: '3.3', name: 'Tuyên truyền tích cực hình ảnh về Trường/Khoa trên các trang mạng xã hội', maxPoints: 3, parentId: '3', order: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: '3.4', name: 'Tích cực tham gia các hoạt động phòng chống tội phạm, tệ nạn xã hội', maxPoints: 3, parentId: '3', order: 4, createdAt: new Date(), updatedAt: new Date() },

    // Tiêu chí 4: Ý thức công dân (25 điểm)
    { id: '4', name: 'Tiêu chí 4. Đánh giá về ý thức công dân trong quan hệ cộng đồng', maxPoints: 25, parentId: null, order: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: '4.1', name: 'Chấp hành nghiêm chỉnh chủ trương của Đảng, chính sách pháp luật của Nhà nước', maxPoints: 8, parentId: '4', order: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: '4.2', name: 'Tích cực tham gia tuyên truyền chủ trương của Đảng, pháp luật của Nhà nước', maxPoints: 5, parentId: '4', order: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: '4.3', name: 'Có mối quan hệ đúng mực với Thầy/Cô, cán bộ, nhân viên Học viện', maxPoints: 5, parentId: '4', order: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: '4.4', name: 'Có mối quan hệ tốt với bạn bè trong lớp và mọi người xung quanh', maxPoints: 5, parentId: '4', order: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: '4.5', name: 'Được biểu dương khen thưởng trong các hoạt động liên quan đến ý thức công dân', maxPoints: 2, parentId: '4', order: 5, createdAt: new Date(), updatedAt: new Date() },

    // Tiêu chí 5: Ý thức tham gia phụ trách lớp, đoàn thể (10 điểm)
    { id: '5', name: 'Tiêu chí 5. Đánh giá về ý thức và kết quả tham gia phụ trách lớp, các đoàn thể trong nhà trường...', maxPoints: 10, parentId: null, order: 5, createdAt: new Date(), updatedAt: new Date() },
    { id: '5.1', name: 'Sinh viên được Học viện phân công làm lớp trưởng, lớp phó, bí thư, BCH Đoàn/Hội...', maxPoints: 4, parentId: '5', order: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: '5.2', name: 'Thành viên tham gia các CLB, đội nhóm trực thuộc Học viện/Khoa', maxPoints: 3, parentId: '5', order: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: '5.3', name: 'Sinh viên đạt thành tích đặc biệt trong học tập, rèn luyện (Olympic, Nghiên cứu khoa học...)', maxPoints: 3, parentId: '5', order: 3, createdAt: new Date(), updatedAt: new Date() },
  ];

  async getCriteriaTree(): Promise<any[]> {
    const roots = this.mockCriteria.filter((c) => !c.parentId);
    const buildTree = (node: any) => {
      const children = this.mockCriteria
        .filter((c) => c.parentId === node.id)
        .sort((a, b) => a.order - b.order);
      if (children.length > 0) {
        node.children = children.map((c) => buildTree({ ...c }));
      }
      return node;
    };
    return roots.map((r) => buildTree({ ...r })).sort((a, b) => a.order - b.order);
  }

  async getAllCriteria(): Promise<CriteriaEntity[]> {
    return this.mockCriteria;
  }

  async updateCriteria(id: string, data: Partial<CriteriaEntity>): Promise<CriteriaEntity> {
    const index = this.mockCriteria.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Criteria not found');
    this.mockCriteria[index] = { ...this.mockCriteria[index], ...data, updatedAt: new Date() };
    return this.mockCriteria[index];
  }

  async createCriteria(data: Partial<CriteriaEntity>): Promise<CriteriaEntity> {
    const newCriteria: CriteriaEntity = {
      id: data.id || `c_${Date.now()}`,
      name: data.name!,
      maxPoints: data.maxPoints!,
      parentId: data.parentId || null,
      order: data.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockCriteria.push(newCriteria);
    return newCriteria;
  }

  async deleteCriteria(id: string): Promise<boolean> {
    const index = this.mockCriteria.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.mockCriteria.splice(index, 1);
    return true;
  }
}
