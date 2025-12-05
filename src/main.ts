import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './configs/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS with explicit origins to support credentials
  const allowedOrigins =
    process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || [
      'http://localhost:3000',
    ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filters
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  // Setup Swagger documentation (always enabled)
  setupSwagger(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 HaloLight API Server                            ║
║                                                       ║
║   Server:      http://localhost:${port}                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}                         ║
║   API Docs:    http://localhost:${port}/docs         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
}

void bootstrap();
