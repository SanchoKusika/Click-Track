import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { PrismaService } from './prisma.service';
import { createSwaggerDocument } from './swagger/document';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.use(helmet());
  app.use(cookieParser());

  const corsOrigins = configService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins, credentials: true });
  const uploadsDirectory = join(process.cwd(), 'uploads');
  mkdirSync(uploadsDirectory, { recursive: true });
  app.useStaticAssets(uploadsDirectory, { prefix: '/uploads' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const swaggerDocument = createSwaggerDocument(app);
  SwaggerModule.setup('api/docs', app, swaggerDocument);
  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
