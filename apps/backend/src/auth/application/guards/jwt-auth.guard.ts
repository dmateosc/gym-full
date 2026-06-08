import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  JwtVerifier,
  JwtPayload,
} from '../../../shared/infrastructure/jwt/jwt-verifier';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/repositories/user.repository.port';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas como públicas (sin autenticación).
 * Uso: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Guard principal de autenticación.
 *
 * 1. Verifica el JWT (firmado por Supabase) — usa JWKS o el secreto.
 * 2. Sobrescribe el claim `role` del JWT con el rol REAL del perfil
 *    local. Supabase emite `role: 'authenticated'`, que no se
 *    corresponde con nuestros roles de aplicación
 *    (`admin` / `instructor` / `user`); confiar en ese claim haría
 *    que cualquier comprobación @Roles() devolviese 403.
 *    Si el usuario aún no tiene perfil sincronizado, queda como
 *    `user` por defecto.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ headers?: Record<string, string>; user?: JwtPayload }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    let payload: JwtPayload | null = null;

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    if (supabaseUrl) {
      payload = await JwtVerifier.verifyWithJwks(
        token,
        `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      );
    }

    if (!payload) {
      const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
      if (jwtSecret) {
        payload = JwtVerifier.verify(token, jwtSecret);
      }
    }

    if (!payload) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Resolve the app-level role from the local DB; Supabase's `role`
    // claim is always 'authenticated' and not authoritative for us.
    try {
      const local = await this.userRepo.findBySupabaseId(payload.sub);
      payload.role = local?.role.value ?? UserRole.USER;
    } catch {
      payload.role = UserRole.USER;
    }

    request.user = payload;
    return true;
  }

  private extractToken(request: {
    headers?: Record<string, string>;
    user?: JwtPayload;
  }): string | null {
    const authHeader = request.headers?.['authorization'];
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
