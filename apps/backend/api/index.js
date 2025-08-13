"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
let cachedApp;
function isOriginAllowed(origin) {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
    }
    if (origin.includes('-dmateoscanos-projects.vercel.app')) {
        return true;
    }
    const allowedDomains = [
        '.vercel.app',
        'centro-wellness-sierra-de-gata.vercel.app',
        'centrowellnesssierradegata.vercel.app',
        'gym-exercise-frontend.vercel.app',
        'gym-exercise-backend.vercel.app',
        'gym-full.vercel.app'
    ];
    const projectKeywords = ['centro', 'wellness', 'gym', 'exercise', 'frontend'];
    if (projectKeywords.some(keyword => origin.includes(keyword))) {
        return true;
    }
    return allowedDomains.some(domain => origin.includes(domain));
}
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Centro Wellness Sierra de Gata API')
        .setDescription(`
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
    `)
        .setVersion('1.0')
        .addTag('exercises', 'Gestión de ejercicios y categorías')
        .addTag('routines', 'Sistema de rutinas y entrenamientos')
        .addTag('health', 'Estado de la API y verificaciones')
        .setContact('Centro Wellness Sierra de Gata', 'https://centro-wellness-sierra-de-gata.vercel.app', 'info@centrowellness.com')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addServer('https://centro-wellness-sierra-de-gata-backend.vercel.app', 'Producción')
        .addServer('http://localhost:3001', 'Desarrollo local')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey, methodKey) => methodKey,
    });
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
        }
    });
    console.log('📚 Swagger documentation available at /api/docs');
}
async function createApp() {
    if (cachedApp) {
        return cachedApp;
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, callback) => {
            console.log(`🌐 CORS request from origin: ${origin || 'unknown'}`);
            if (!origin) {
                console.log('✅ CORS: Request without origin allowed');
                return callback(null, true);
            }
            if (isOriginAllowed(origin)) {
                console.log(`✅ CORS: Origin ${origin} allowed`);
                callback(null, true);
            }
            else {
                console.log(`❌ CORS: Origin ${origin} blocked`);
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    setupSwagger(app);
    app.setGlobalPrefix('api');
    await app.init();
    cachedApp = app;
    console.log('🚀 Centro Wellness Sierra de Gata API initialized for Vercel');
    return app;
}
async function handler(req, res) {
    try {
        const app = await createApp();
        const expressApp = app.getHttpAdapter().getInstance();
        return expressApp(req, res);
    }
    catch (error) {
        console.error('❌ Vercel handler error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to initialize application'
        });
    }
}
//# sourceMappingURL=main.vercel.js.map