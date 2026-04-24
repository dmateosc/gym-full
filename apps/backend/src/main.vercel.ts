import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Cache de la instancia de la aplicación para Vercel
let cachedApp: INestApplication;


/**
 * 🔧 Configuración de Swagger/OpenAPI
 * Documenta toda la API REST del Centro Wellness Sierra de Gata
 */
function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Centro Wellness Sierra de Gata API')
    .setDescription(
      `
🏋️ **API REST completa para la gestión del gimnasio**

Esta API proporciona endpoints para la gestión de ejercicios, rutinas y datos del Centro Wellness Sierra de Gata.

## 🚀 Características principales:
- **Gestión de ejercicios**: CRUD completo con filtrado por categorías
- **Sistema de rutinas**: Creación y gestión de rutinas personalizadas  
- **Estadísticas**: Métricas y análisis de ejercicios
- **Búsqueda avanzada**: Filtros por nombre, categoría, dificultad y grupos musculares
- **Documentación interactiva**: Swagger UI para pruebas en tiempo real

## 📚 Tecnologías:
- **Backend**: NestJS + TypeScript
- **Base de datos**: PostgreSQL con TypeORM
- **Deployment**: Vercel Serverless
- **Documentación**: OpenAPI 3.0

## 🔗 Enlaces:
- **Frontend**: Centro Wellness Sierra de Gata App
- **Repositorio**: GitHub - Gym Full Stack
    `,
    )
    .setVersion('1.0')
    .addTag('exercises', 'Gestión de ejercicios y categorías')
    .addTag('routines', 'Sistema de rutinas y entrenamientos')
    .addTag('health', 'Estado de la API y verificaciones')
    .setContact(
      'Centro Wellness Sierra de Gata',
      'https://centro-wellness-sierra-de-gata.vercel.app',
      'info@centrowellness.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(
      'https://centro-wellness-sierra-de-gata-backend.vercel.app',
      'Producción',
    )
    .addServer('http://localhost:3001', 'Desarrollo local')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Centro Wellness Sierra de Gata API',
    customfavIcon: '🏋️',
    customCss: `
      .swagger-ui .topbar { background-color: #1f2937; }
      .swagger-ui .topbar-wrapper img { display: none; }
      .swagger-ui .topbar-wrapper .link:after { content: '🏋️ Centro Wellness API'; color: white; font-weight: bold; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  console.log('📚 Swagger documentation available at /api/docs');
}

async function createApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule);

  // 🔍 Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 📚 Configurar Swagger en producción y desarrollo
  setupSwagger(app);

  // Configurar prefijo global
  app.setGlobalPrefix('api');

  await app.init();
  cachedApp = app;

  console.log('🚀 Centro Wellness Sierra de Gata API initialized for Vercel');

  return app;
}

// Handler principal para Vercel
// CORS headers are injected by vercel.json headers config at infra level
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const app = await createApp();
    const expressApp = app.getHttpAdapter().getInstance() as (
      req: VercelRequest,
      res: VercelResponse,
    ) => void;
    expressApp(req, res);
  } catch (error: unknown) {
    console.error('❌ Vercel handler error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal Server Error',
      message: errorMessage,
    });
  }
}
