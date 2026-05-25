import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/constants/status.enum';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(username: string, role: string) {
    const validRoles = Object.values(UserRole);
    const resolvedRole = validRoles.includes(role as UserRole)
      ? (role as UserRole)
      : UserRole.SINHVIEN;

    const payload = {
      sub: `user_${Date.now()}`,
      username: username,
      role: resolvedRole,
      fullName: username === 'admin' ? 'Quản trị viên' : `Người dùng ${username}`,
      classId: 'CNPM-K45-A',
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        fullName: payload.fullName,
        classId: payload.classId,
      },
    };
  }
}
