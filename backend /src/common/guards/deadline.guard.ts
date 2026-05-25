import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AcademicYearService } from '../../modules/academic-year/academic-year.service';

@Injectable()
export class DeadlineGuard implements CanActivate {
  constructor(private academicYearService: AcademicYearService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const semesterId = request.body?.semesterId || request.query?.semesterId;

    if (!semesterId) {
      throw new BadRequestException('semesterId là bắt buộc để kiểm tra thời hạn!');
    }

    const semester = await this.academicYearService.getSemesterById(semesterId);
    if (!semester) {
      throw new BadRequestException('Học kỳ không hợp lệ!');
    }

    const now = new Date();
    if (now > semester.han_sv_tu_cham) {
      throw new ForbiddenException(
        `Đã quá thời hạn sinh viên tự chấm điểm cho học kỳ này (Hạn cuối: ${semester.han_sv_tu_cham.toLocaleString()})`,
      );
    }

    return true;
  }
}
