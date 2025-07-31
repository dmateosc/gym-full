import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

// Variable global para Vercel serverless
let app: INestApplication | null = null;

// Test CI/CD integration - Vercel deployment test
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
    /^https:\/\/gym-full-.*\.vercel\.app$/, // Cualquier deployment de gym-full en Vercel
    /^https:\/\/gym-full-.*-dmateoscanos-projects\.vercel\.app$/, // Patrón específico para tu cuenta
    /^https:\/\/.*-dmateoscanos-projects\.vercel\.app$/, // Cualquier proyecto en tu cuenta
    /^https:\/\/frontend-.*\.vercel\.app$/, // Preview deployments del frontend
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
    '🔧 CORS Origins configured:',
    origins.map((o) => o.toString()),
  );
  return origins;
}

async function createNestApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Habilitar CORS para el frontend (local y producción)
    app.enableCors({
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
          console.warn(`❌ CORS: Origin not allowed: ${origin}`);
          console.log(
            '✅ Allowed origins:',
            allowedOrigins.map((o) => o.toString()),
          );
          callback(new Error('Not allowed by CORS'), false);
        }
      },
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Habilitar interceptor global de logging
    app.useGlobalInterceptors(new LoggingInterceptor());

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
async function handler(req: any, res: any): Promise<any> {
  const nestApp = await createNestApp();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const expressApp = nestApp.getHttpAdapter().getInstance();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return expressApp(req, res);
}

// Export default para Vercel
export default handler;

// Export named para compatibilidad
export { handler };

// Solo ejecutar bootstrap en desarrollo local (no en Vercel)
if (!process.env.VERCEL && require.main === module) {
  void bootstrap();
}
