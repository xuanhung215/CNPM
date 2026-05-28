import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../database/entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async getNotifications(userId?: string) {
    return this.notificationRepository.find({
      where: userId ? { userId } : {},
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    await this.notificationRepository.update(id, { isRead: true });
  }

  async addNotification(title: string, content: string, userId?: string) {
    const notification = this.notificationRepository.create({
      title,
      content,
      userId,
    });
    await this.notificationRepository.save(notification);
    
    // Emit real-time socket event
    this.notificationsGateway.sendNotification(title, content, userId);
    console.log(`[Notification] To ${userId || 'All'}: ${title} - ${content}`);
  }
}
