import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { SwaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Middlewares
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());

  // Swagger config
  SwaggerConfig(app);

  // Validation pipe
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

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4000',
      'http://192.168.1.2:4000',
      'http://localhost:' + (process.env.PORT || '3000'),
      'http://localhost:' + (process.env.NEXT_PUBLIC_PORT || '4000')
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');

  console.log(`🚀 Application is running on: ${await app.getUrl()}`);

}

bootstrap();
