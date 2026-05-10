import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — equivalent to Spring's @Valid
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter — normalises all error responses to ApiErrorResponse shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors — wrap every successful response in ApiResponse<T> and log request timings
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

  // CORS
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // ── Swagger ────────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Save Money API')
    .setDescription(
      'REST API for the Save Money app — migrated from Spring Boot to NestJS.\n\n' +
      'All protected endpoints require a Bearer JWT token obtained from `POST /api/auth/login`.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT',
    )
    .addTag('Auth', 'Authentication — login and JWT token issuance')
    .addTag('Users', 'User management (CRUD)')
    .addTag('Bills', 'Bill management — CRUD, reorder and per-user queries')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Available at http://localhost:8080/api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  // ──────────────────────────────────────────────────────────────────────────

  const port = process.env.PORT ?? 8080;
  await app.listen(port);
  console.log(`Application running on  http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
