import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../application/guards/jwt-auth.guard';
import { CurrentUser } from '../../application/decorators/current-user.decorator';
import { JwtPayload } from '../../../shared/infrastructure/jwt/jwt-verifier';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  /**
   * Devuelve el payload del JWT de Supabase del usuario autenticado.
   * Útil para debug / verificar token.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener payload del token Supabase' })
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}
