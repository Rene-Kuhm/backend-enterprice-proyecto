import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';
import { SentryService } from './common/sentry/sentry.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  const sentryService = app.get(SentryService);

  // Use custom logger
  app.useLogger(loggerService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*').split(',');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Sentry error tracking
  sentryService.setupGlobalFilter(app);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Enterprise Backend API')
    .setDescription(
      'Production-ready Enterprise API with Authentication, Authorization, Notifications, File Upload, and Observability',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication and Authorization endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Roles', 'Role and permission management')
    .addTag('Notifications', 'Email, SMS, and Push notifications')
    .addTag('Files', 'File upload and management')
    .addTag('Health', 'Health check and monitoring')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  loggerService.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
  loggerService.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`, 'Bootstrap');
  loggerService.log(
    `🏥 Health check: http://localhost:${port}/${apiPrefix}/health`,
    'Bootstrap',
  );
}

bootstrap();
