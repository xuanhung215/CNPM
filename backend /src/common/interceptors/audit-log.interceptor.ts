import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const username = user?.username || 'Guest';
        const role = user?.role || 'Guest';
        
        // Ghi nhật ký vào database hoặc console
        console.log(
          `[AuditLog] User: ${username} (${role}) | Action: ${method} ${url} | Duration: ${duration}ms | Request: ${JSON.stringify(body)}`
        );
      }),
    );
  }
}
