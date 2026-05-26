import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin not allowed — ${origin}`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Centro Wellness Sierra de Gata API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('exercises', 'Ejercicios')
    .addTag('routines', 'Rutinas')
    .addTag('health', 'Health')
    .addServer(process.env.API_BASE_URL ?? 'http://localhost:3001', 'Server')
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    {
      customSiteTitle: 'Centro Wellness API',
      swaggerOptions: { persistAuthorization: true, filter: true },
    },
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`Backend running on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
  console.log(`CORS origins: ${allowedOrigins.join(', ')}`);
}

void bootstrap();
