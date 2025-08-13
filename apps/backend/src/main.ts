import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

// Variable global para Vercel serverless
let app: INestApplication | null = null;

// Test CI/CD integration - Vercel deployment test
// Función inteligente para validar orígenes CORS sin hardcodear URLs
function isOriginAllowed(origin: string): boolean {
  // 1. Desarrollo local - siempre permitido
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return true;
  }

  // 2. Todos los deployments de la organización en Vercel
  if (origin.includes('-dmateoscanos-projects.vercel.app')) {
    return true;
  }

  // 3. Dominios principales del proyecto (sin hardcodear URLs específicas)
  const allowedDomains = [
    '.vercel.app',
    'centro-wellness-sierra-de-gata.vercel.app',
    'centrowellnesssierradegata.vercel.app',
    'gym-exercise-frontend.vercel.app',
    'gym-exercise-backend.vercel.app',
    'gym-full.vercel.app'
  ];
  
  const hostname = origin.replace(/^https?:\/\//, '');
  
  // Permitir cualquier subdominio de vercel.app que contenga palabras clave del proyecto
  if (hostname.endsWith('.vercel.app')) {
    if (
      hostname.includes('gym') || 
      hostname.includes('frontend') || 
      hostname.includes('exercise') ||
      hostname.includes('wellness') ||
      hostname.includes('centro')
    ) {
      return true;
    }
  }

  return allowedDomains.some(domain => hostname.endsWith(domain));
}

function getAllowedOrigins(): (string | RegExp)[] {
  // Solo retornamos patrones básicos, la lógica real está en isOriginAllowed
  return [
    'http://localhost:5173',
    'http://localhost:3000',
    /^http:\/\/localhost:\d+$/,
    /^https:\/\/.*-dmateoscanos-projects\.vercel\.app$/,
    /^https:\/\/gym-.*\.vercel\.app$/,
    /^https:\/\/frontend-.*\.vercel\.app$/
  ];
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

        // Verificar si el origin está permitido usando función inteligente
        const isAllowed = isOriginAllowed(origin);

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
