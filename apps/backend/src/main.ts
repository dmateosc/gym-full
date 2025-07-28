import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend (local y producción)
  app.enableCors({
    origin: [
      'http://localhost:5173', // Desarrollo local
      'https://dmateosc.github.io', // GitHub Pages producción
      /^https:\/\/.*\.github\.io$/, // Cualquier subdomain de GitHub Pages
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar prefijo global para la API
  app.setGlobalPrefix('api');

  // Usar el puerto de Heroku o el por defecto
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Backend running on port ${port}`);
}
void bootstrap();
