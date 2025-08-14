import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.use(cookieParser());

  app.setGlobalPrefix('meshwork/api')

  // Habilitar CORS para desarrollo
  app.enableCors({
    origin: configService.get('FRONTEND_URL'), 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      })
    );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
