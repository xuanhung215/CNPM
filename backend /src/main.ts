import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Kích hoạt CORS hỗ trợ kết nối từ Frontend
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Thiết lập tiền tố /api cho tất cả các đường dẫn
  app.setGlobalPrefix('api');

  // Kích hoạt bộ lọc lỗi tập trung toàn hệ thống
  app.useGlobalFilters(new HttpExceptionFilter());

  // Kích hoạt Interceptor tự động ghi log thao tác
  app.useGlobalInterceptors(new AuditLogInterceptor());

  // Kích hoạt validation tự động cho DTO payloads
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
}
bootstrap();
