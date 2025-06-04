import { Logger as NestLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
// import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

// import { middleware } from './app.middleware';
import { AppModule } from './app.module';

/**
 * https://docs.nestjs.com
 * https://github.com/nestjs/nest/tree/master/sample
 * https://github.com/nestjs/nest/issues/2249#issuecomment-494734673
 */
async function bootstrap(): Promise<string> {
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // app.useLogger(app.get(Logger));
  // app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // Enable CORS
  app.enableCors({
    origin: [
      // Backend server URLs
      'http://localhost:8089',
      'http://192.168.1.2:8089',
      // Expo development server URLs
      'http://localhost:8081',
      'http://192.168.1.2:8081',
      'exp://192.168.1.2:8081',
      // OAuth redirect URIs
      'https://auth.expo.io',
      'https://auth.expo.io/@toantran.11/stadium-booking-frontend',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  if (isProduction) {
    app.enable('trust proxy');
  }

  // Express Middleware
  // middleware(app);

  app.enableShutdownHooks();
  await app.listen(process.env.PORT || 3000);

  return await app.getUrl();
}

void (async (): Promise<void> => {
  try {
    const url = await bootstrap();
    NestLogger.log(url, 'Bootstrap');
  } catch (error) {
    NestLogger.error(error, 'Bootstrap');
  }
})();
