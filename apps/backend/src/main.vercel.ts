import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Para Vercel serverless
let appInstance: INestApplication | null = null;

async function createApp(): Promise<INestApplication> {
  if (!appInstance) {
    appInstance = await NestFactory.create(AppModule);

    // Habilitar CORS para el frontend (local y producción)
    appInstance.enableCors({
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
    appInstance.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Configurar prefijo global para la API
    appInstance.setGlobalPrefix('api');

    await appInstance.init();
  }
  return appInstance;
}

// Función para desarrollo local
async function bootstrap(): Promise<void> {
  const app = await createApp();

  // Usar el puerto de Vercel, Heroku o el por defecto
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `🔗 Database connected: ${process.env.DATABASE_HOST || 'localhost'}`,
  );
}

// Exportar para Vercel
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const app = await createApp();
  const expressApp = app.getHttpAdapter().getInstance() as (
    req: any,
    res: any,
  ) => void;
  expressApp(req, res);
}

// Solo ejecutar bootstrap en desarrollo local
if (require.main === module) {
  void bootstrap();
}
