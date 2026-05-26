import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './application/guards/jwt-auth.guard';
import { RolesGuard } from './application/guards/roles.guard';
import { AuthController } from './infrastructure/http/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { UsersModule } from '../users/infrastructure/users.module';

/**
 * Módulo de autenticación global.
 * Gestiona JWT propio (sin Supabase).
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'change-me-in-production',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard, RolesGuard, LoginUseCase, RegisterUseCase],
  exports: [JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
