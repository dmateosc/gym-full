import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Para Vercel serverless
let appInstance: INestApplication | null = null;

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

// Función para obtener orígenes CORS permitidos dinámicamente
function getAllowedOrigins(): (string | RegExp)[] {
  const origins: (string | RegExp)[] = [
    // Desarrollo local
    'http://localhost:5173',
    'http://localhost:3000',
    /^http:\/\/localhost:\d+$/,
    
    // Patrones dinámicos de Vercel
    /^https:\/\/.*-dmateoscanos-projects\.vercel\.app$/,
    /^https:\/\/gym-.*\.vercel\.app$/,
    /^https:\/\/frontend-.*\.vercel\.app$/
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
            getAllowedOrigins().map((o) => o.toString()),
          );
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

// También exportar como named export para compatibilidad
export { handler };

// Solo ejecutar bootstrap en desarrollo local
if (require.main === module) {
  void bootstrap();
}
