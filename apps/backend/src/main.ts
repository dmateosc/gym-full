import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

// Variable global para Vercel serverless
let app: INestApplication | null = null;

// Función para obtener orígenes CORS permitidos dinámicamente
function getAllowedOrigins(): (string | RegExp)[] {
  const origins: (string | RegExp)[] = [
    'http://localhost:5173', // Desarrollo local
    /^https:\/\/.*\.github\.io$/, // Cualquier subdomain de GitHub Pages
  ];

  // Agregar FRONTEND_URL si está configurada (para producción)
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  // Agregar dominio específico si está configurado
  if (process.env.GITHUB_PAGES_URL) {
    origins.push(process.env.GITHUB_PAGES_URL);
  }

  return origins;
}

async function createNestApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Habilitar CORS para el frontend (local y producción)
    app.enableCors({
      origin: getAllowedOrigins(),
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

    // Solo inicializar para Vercel, no hacer listen aquí
    if (process.env.VERCEL) {
      await app.init();
    }
  }
  return app;
}

// Función principal para desarrollo local y otros entornos
async function bootstrap(): Promise<void> {
  const nestApp = await createNestApp();

  // Usar el puerto de Heroku, Vercel o el por defecto
  const port = process.env.PORT || 3001;
  await nestApp.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `🔗 Database connected: ${process.env.DATABASE_HOST || 'localhost'}`,
  );
  console.log(`🌍 CORS origins: ${getAllowedOrigins().join(', ')}`);
}

// Función handler para Vercel serverless

export async function handler(req: any, res: any): Promise<any> {
  const nestApp = await createNestApp();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const expressApp = nestApp.getHttpAdapter().getInstance();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return expressApp(req, res);
}

// Solo ejecutar bootstrap en desarrollo local (no en Vercel)
if (!process.env.VERCEL && require.main === module) {
  void bootstrap();
}
