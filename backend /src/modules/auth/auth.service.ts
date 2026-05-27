import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async login(username: string, password?: string) {
    if (!password) {
      throw new UnauthorizedException('Mật khẩu là bắt buộc');
    }

    const user = await this.usersService.findByUsernameWithPassword(username);
    
    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password || '');
    } catch (e) {
      // If bcrypt fails (e.g. data is not a hash), fallback to plain text check for migration
      isPasswordValid = password === user.password;
      
      if (isPasswordValid) {
        // Lazy migration: Hash the plain text password for next time
        await this.usersService.changePassword(user.id, password);
      }
    }

    // Second check if the first one was bcrypt but failed, it might still be plain text
    if (!isPasswordValid && password === user.password) {
      isPasswordValid = true;
      await this.usersService.changePassword(user.id, password);
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      classId: user.classId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        classId: user.classId,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      delete payload.iat;
      delete payload.exp;
      
      return {
        accessToken: await this.jwtService.signAsync(payload),
        refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
