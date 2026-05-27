import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async getLogs(query?: { username?: string; action?: string }) {
    const qb = this.auditLogRepository.createQueryBuilder('log');

    if (query?.username) {
      qb.andWhere('log.username LIKE :username', { username: `%${query.username}%` });
    }

    if (query?.action) {
      qb.andWhere('log.action LIKE :action', { action: `%${query.action}%` });
    }

    qb.orderBy('log.timestamp', 'DESC');
    qb.take(100);

    return qb.getMany();
  }

  async addLog(username: string, action: string) {
    const log = this.auditLogRepository.create({
      username,
      action,
    });
    await this.auditLogRepository.save(log);
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
