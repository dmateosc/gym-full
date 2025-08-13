import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Para Vercel serverless
let appInstance: INestApplication | null = null;

// Función para obtener orígenes CORS permitidos dinámicamente
function getAllowedOrigins(): (string | RegExp)[] {
  const origins: (string | RegExp)[] = [
    'http://localhost:5173', // Desarrollo local
    'http://localhost:3000', // Desarrollo local alternativo
    'https://gym-full.vercel.app', // Producción principal
    'https://gym-full-ctxgkzave-dmateoscanos-projects.vercel.app', // URL específica nueva
    'https://gym-full-jpzg3jdnb-dmateoscanos-projects.vercel.app', // URL específica actual
    'https://gym-full-aect69c8o-dmateoscanos-projects.vercel.app', // URL anterior
    'https://gym-full-ppedygzaj-dmateoscanos-projects.vercel.app', // URL anterior 2
    'https://frontend-drab-eight-89.vercel.app', // URL de preview deployment
    'https://frontend-vpw4wj9cw-dmateoscanos-projects.vercel.app', // URL actual del frontend
    /^https:\/\/gym-full-.*\.vercel\.app$/, // Cualquier deployment de gym-full en Vercel
    /^https:\/\/gym-full-.*-dmateoscanos-projects\.vercel\.app$/, // Patrón específico para tu cuenta
    /^https:\/\/.*-dmateoscanos-projects\.vercel\.app$/, // Cualquier proyecto en tu cuenta
    /^https:\/\/frontend-.*\.vercel\.app$/, // Preview deployments del frontend
    /^https:\/\/frontend-.*-dmateoscanos-projects\.vercel\.app$/, // Frontend deployments específicos
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

  // En desarrollo, permitir cualquier localhost
  if (process.env.NODE_ENV === 'development') {
    origins.push(/^http:\/\/localhost:\d+$/);
  }

  console.log(
    '🔧 CORS Origins configured (Vercel):',
    origins.map((o) => o.toString()),
  );
  return origins;
}

async function createApp(): Promise<INestApplication> {
  if (!appInstance) {
    appInstance = await NestFactory.create(AppModule);

    // Habilitar CORS para el frontend (local y producción)
    appInstance.enableCors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        const allowedOrigins = getAllowedOrigins();

        // Permitir requests sin origin (como Postman, curl, etc.)
        if (!origin) return callback(null, true);

        // Logging para debugging
        console.log(`🔍 CORS request from origin: ${origin}`);

        // Verificar si el origin está permitido
        const isAllowed = allowedOrigins.some((allowedOrigin) => {
          if (typeof allowedOrigin === 'string') {
            return allowedOrigin === origin;
          } else if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(origin);
          }
          return false;
        });

        if (isAllowed) {
          console.log(`✅ CORS: Origin allowed: ${origin}`);
          callback(null, true);
        } else {
          console.log(`❌ CORS: Origin not allowed: ${origin}`);
          callback(new Error('Not allowed by CORS'), false);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
      ],
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
