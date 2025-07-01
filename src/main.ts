// src/main.ts
import 'reflect-metadata'; // bắt buộc
import { Logger } from '@nestjs/common'; // default Logger
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🔧 [bootstrap] start'); // debug đầu vào
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Tăng giới hạn kích thước body
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:8089',
      'http://192.168.1.2:8089',
      'http://localhost:8081',
      'http://192.168.1.2:8081',
      'exp://192.168.1.2:8081',
      'https://auth.expo.io',
      'https://auth.expo.io/@toantran.11/stadium-booking-frontend',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');
  }

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000);

  const url = await app.getUrl();
  Logger.log(`🚀 Application is running on: ${url}`, 'Bootstrap');
}

bootstrap().catch((err) => {
  Logger.error('❌ Bootstrap failed', err.stack, 'Bootstrap');
  process.exit(1);
});
