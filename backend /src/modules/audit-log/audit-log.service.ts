import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogService {
  private logs = [
    { id: 'l1', username: 'cvht01', action: 'Duyệt điểm phiếu rèn luyện của Nguyễn Văn A (sv01)', timestamp: new Date() },
    { id: 'l2', username: 'sv01', action: 'Nộp phiếu tự đánh giá rèn luyện học kỳ 20252', timestamp: new Date() },
  ];

  async getLogs() {
    return this.logs;
  }

  async addLog(username: string, action: string) {
    this.logs.unshift({
      id: `l${Date.now()}`,
      username,
      action,
      timestamp: new Date(),
    });
  }

  async logScoreChange(
    username: string,
    sheetId: string,
    criteriaId: string,
    oldScore: number,
    newScore: number,
    reason: string,
  ) {
    const action = `Thay đổi điểm tiêu chí ${criteriaId} của phiếu ${sheetId}: ${oldScore} -> ${newScore}. Lý do: ${reason}`;
    await this.addLog(username, action);
    console.log(`[AuditLog] ${username}: ${action}`);
  }
}
