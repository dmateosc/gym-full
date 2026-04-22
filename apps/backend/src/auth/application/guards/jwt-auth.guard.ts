import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtVerifier } from '../../../shared/infrastructure/jwt/jwt-verifier';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Guard principal de autenticación.
 * Verifica el JWT de Supabase en el header Authorization: Bearer <token>
 * Añade el payload decodificado como request.user
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Permitir rutas marcadas como públicas
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      this.logger.error('SUPABASE_JWT_SECRET no está configurado');
      throw new UnauthorizedException('Error de configuración del servidor');
    }

    const payload = JwtVerifier.verify(token, jwtSecret);
    if (!payload) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Adjuntar usuario al request para uso en decoradores y guards posteriores
    request.user = payload;
    return true;
  }

  private extractToken(request: { headers?: Record<string, string> }): string | null {
    const authHeader = request.headers?.['authorization'];
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}

/**
 * Decorador para marcar rutas como públicas (sin autenticación).
 * Uso: @Public()
 */
import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
