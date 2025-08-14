import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Mensaje de bienvenida',
    description: 'Endpoint raíz que devuelve un mensaje de bienvenida',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje de bienvenida exitoso',
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check del API',
    description: 'Verificar el estado de salud del servidor',
  })
  @ApiResponse({
    status: 200,
    description: 'Servidor funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-08-14T10:30:00.000Z' },
        swagger: { type: 'string', example: '/api/docs' },
      },
    },
  })
  getHealth(): { status: string; timestamp: string; swagger: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      swagger: '/api/docs',
    };
  }
}
