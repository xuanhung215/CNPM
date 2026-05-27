import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettingEntity } from '../../database/entities/system-setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemSettingEntity)
    private settingsRepository: Repository<SystemSettingEntity>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultSettings();
  }

  private async seedDefaultSettings() {
    const defaults = [
      {
        key: 'grading_thresholds',
        value: JSON.stringify([
          { label: 'Xuất sắc', min: 90 },
          { label: 'Tốt', min: 80 },
          { label: 'Khá', min: 70 },
          { label: 'Trung bình', min: 50 },
          { label: 'Yếu', min: 30 },
          { label: 'Kém', min: 0 },
        ]),
        description: 'Ngưỡng phân loại điểm rèn luyện',
      },
      {
        key: 'complaint_window_days',
        value: '7',
        description: 'Số ngày tối đa sinh viên được khiếu nại sau khi chốt điểm',
      },
    ];

    for (const setting of defaults) {
      const exists = await this.settingsRepository.findOne({ where: { key: setting.key } });
      if (!exists) {
        await this.settingsRepository.save(this.settingsRepository.create(setting));
      }
    }
  }

  async getSetting(key: string): Promise<any> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) return null;
    
    try {
      return JSON.parse(setting.value);
    } catch {
      return setting.value;
    }
  }

  async updateSetting(key: string, value: any) {
    const valStr = typeof value === 'string' ? value : JSON.stringify(value);
    await this.settingsRepository.update(key, { value: valStr });
  }

  async getAllSettings() {
    return this.settingsRepository.find();
  }
}