import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
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
    
    // In a real app, you could emit a socket.io event here
    console.log(`[Notification] To ${userId || 'All'}: ${title} - ${content}`);
  }
}
