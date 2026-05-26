import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../../shared/infrastructure/jwt/jwt-verifier';

/**
 * Decorador para obtener el usuario autenticado del request.
 * Uso: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
