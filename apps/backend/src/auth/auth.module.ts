import { Module, Global } from '@nestjs/common';
import { JwtAuthGuard } from './application/guards/jwt-auth.guard';
import { RolesGuard } from './application/guards/roles.guard';

/**
 * Módulo de autenticación global.
 * Exporta los guards para uso en toda la aplicación.
 */
@Global()
@Module({
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
