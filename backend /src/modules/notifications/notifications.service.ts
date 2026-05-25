import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private notifications = [
    { id: 'n1', title: 'Thời hạn tự đánh giá học kỳ II', content: 'Hệ thống đã mở cổng tự đánh giá điểm rèn luyện. Hạn cuối cùng là ngày 30/06.', createdAt: new Date() },
    { id: 'n2', title: 'Cập nhật từ Ban cán sự', content: 'Phiếu điểm rèn luyện của bạn đã được Lớp trưởng duyệt, chuyển tiếp cho Cố vấn học tập.', createdAt: new Date() },
  ];

  async getNotifications() {
    return this.notifications;
  }
}
