import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../database/entities/user.entity';
import { UserRole } from '../../common/constants/status.enum';

@Injectable()
export class UsersService {
  private mockUsers: UserEntity[] = [
    { id: 'admin', username: 'admin', email: 'admin@school.edu.vn', fullName: 'Quản trị viên', role: UserRole.ADMIN, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cvht01', username: 'cvht01', email: 'cvht01@school.edu.vn', fullName: 'Cố vấn học tập 1', role: UserRole.CVHT, classId: 'CNPM-K45-A', createdAt: new Date(), updatedAt: new Date() },
    { id: 'bcs01', username: 'bcs01', email: 'bcs01@school.edu.vn', fullName: 'Lớp trưởng A', role: UserRole.BCS, classId: 'CNPM-K45-A', createdAt: new Date(), updatedAt: new Date() },
    { id: 'sv01', username: 'sv01', email: 'sv01@school.edu.vn', fullName: 'Nguyễn Văn A', role: UserRole.SINHVIEN, classId: 'CNPM-K45-A', createdAt: new Date(), updatedAt: new Date() },
    { id: 'sv02', username: 'sv02', email: 'sv02@school.edu.vn', fullName: 'Trần Thị B', role: UserRole.SINHVIEN, classId: 'CNPM-K45-A', createdAt: new Date(), updatedAt: new Date() },
  ];

  async findByUsername(username: string): Promise<UserEntity | undefined> {
    return this.mockUsers.find(u => u.username === username);
  }

  async findById(id: string): Promise<UserEntity | undefined> {
    return this.mockUsers.find(u => u.id === id);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.mockUsers;
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const newUser: UserEntity = {
      id: `u_${Date.now()}`,
      username: userData.username!,
      password: userData.password || '123456',
      email: userData.email!,
      fullName: userData.fullName!,
      role: userData.role!,
      classId: userData.classId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    this.mockUsers.push(newUser);
    return newUser;
  }

  async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    this.mockUsers[index] = { ...this.mockUsers[index], ...userData, updatedAt: new Date() };
    return this.mockUsers[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.mockUsers.splice(index, 1);
    return true;
  }
}
