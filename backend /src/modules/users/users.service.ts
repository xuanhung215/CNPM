import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../database/entities/user.entity';
import { UserRole } from '../../common/constants/status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByUsernameWithPassword(username: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        fullName: true,
        classId: true,
      },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(query?: { search?: string; role?: UserRole; classId?: string }): Promise<UserEntity[]> {
    const qb = this.usersRepository.createQueryBuilder('user');

    if (query?.search) {
      qb.andWhere('(user.fullName LIKE :search OR user.id LIKE :search OR user.username LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query?.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query?.classId) {
      qb.andWhere('user.classId = :classId', { classId: query.classId });
    }

    return qb.getMany();
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password || '123456', salt);
    
    const newUser = this.usersRepository.create({
      id: userData.id || `u_${Date.now()}`,
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      classId: userData.classId,
    });
    return this.usersRepository.save(newUser);
  }

  async assignToClass(id: string, classId: string, currentUser: any): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (currentUser.role === UserRole.CVHT && currentUser.classId !== classId) {
      throw new ForbiddenException('Bạn chỉ có thể gán sinh viên vào lớp của mình quản lý');
    }

    user.classId = classId;
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    
    if (userData.password) {
      const salt = await bcrypt.genSalt();
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    Object.assign(user, userData);
    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.usersRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }

  async changePassword(id: string, newPassword: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await this.usersRepository.save(user);
    return true;
  }
}
