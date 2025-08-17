import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // 3. Dominios principales del proyecto (usando variables de entorno cuando sea posible)
  const allowedDomains = [
    '.vercel.app',
    // Usar variables de entorno para dominios específicos
    process.env.FRONTEND_DOMAIN || 'centro-wellness-sierra-de-gata.vercel.app',
    'centrowellnesssierradegata.vercel.app',
    'gym-exercise-frontend.vercel.app',
    'gym-exercise-backend.vercel.app',
    'gym-full.vercel.app',
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

  return allowedDomains.some((domain) => hostname.endsWith(domain));
}

function getAllowedOrigins(): (string | RegExp)[] {
  // Solo retornamos patrones básicos, la lógica real está en isOriginAllowed
  return [
    'http://localhost:5173',
    'http://localhost:3000',
    /^http:\/\/localhost:\d+$/,
    /^https:\/\/.*-dmateoscanos-projects\.vercel\.app$/,
    /^https:\/\/gym-.*\.vercel\.app$/,
    /^https:\/\/frontend-.*\.vercel\.app$/,
  ];
}

/**
 * 📖 Configuración de Swagger API Documentation
 * Genera documentación automática para Centro Wellness Sierra de Gata
 */
function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Centro Wellness Sierra de Gata API')
    .setDescription(
      `
      🏋️ API REST completa para la gestión del Centro Wellness Sierra de Gata
      
      ## Características:
      - 💪 Gestión de ejercicios por categorías (fuerza, cardio, flexibilidad)
      - 📅 Sistema de rutinas personalizadas
      - 🎯 Filtros avanzados por dificultad y grupo muscular
      - 📊 Seguimiento de progreso
      
      ## Tecnologías:
      - **Framework**: NestJS + TypeScript
      - **Base de datos**: PostgreSQL (Supabase)
      - **Deployment**: Vercel Serverless
      - **Autenticación**: JWT (próximamente)
      
      ## URLs:
      - **Producción**: Configurado automáticamente según deployment
      - **Frontend**: Configurado automáticamente según variables de entorno
    `,
    )
    .setVersion('1.0')
    .addTag('exercises', 'Gestión de ejercicios y categorías')
    .addTag('routines', 'Rutinas de entrenamiento')
    .addTag('health', 'Endpoints de salud y monitoreo')
    .addServer(
      process.env.API_BASE_URL || 'http://localhost:3001',
      'Servidor principal',
    )
    .addServer('http://localhost:3001', 'Desarrollo local')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configurar Swagger UI en /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Centro Wellness Sierra de Gata - API Docs',
    customfavIcon: '/favicon.ico',
    customCss: `
      .topbar-wrapper img { content: url('/logo.png'); height: 40px; }
      .swagger-ui .topbar { background-color: #dc2626; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
    },
  });

  console.log('📖 Swagger documentation available at: /api/docs');
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

    // 📖 Configurar Swagger API Documentation
    setupSwagger(app);

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
