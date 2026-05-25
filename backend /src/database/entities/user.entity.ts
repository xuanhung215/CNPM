import { UserRole } from '../../common/constants/status.enum';

export class UserEntity {
  id: string;
  username: string;
  password?: string; // Bổ sung password để quản lý
  email: string;
  fullName: string;
  role: UserRole;
  classId?: string; // Mã lớp
  createdAt: Date;
  updatedAt: Date;
}
