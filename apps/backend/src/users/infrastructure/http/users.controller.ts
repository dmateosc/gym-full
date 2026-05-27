import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/application/guards/jwt-auth.guard';
import { JwtPayload } from '../../../shared/infrastructure/jwt/jwt-verifier';
import { RolesGuard } from '../../../auth/application/guards/roles.guard';
import { Roles } from '../../../auth/application/decorators/roles.decorator';
import { UserRole } from '../../../auth/application/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/application/decorators/current-user.decorator';

import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { UpsertUserProfileUseCase } from '../../application/use-cases/upsert-user-profile.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/repositories/user.repository.port';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly getAllUsers: GetAllUsersUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly updateUserRole: UpdateUserRoleUseCase,
    private readonly upsertProfile: UpsertUserProfileUseCase,
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getMyProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto | null> {
    const entity = await this.userRepo.findBySupabaseId(user.sub);
    if (!entity) return null;
    return UserResponseDto.fromDomain(entity);
  }

  @Post('me/sync')
  @ApiOperation({ summary: 'Sincronizar perfil de Supabase con la BD local' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async syncMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() body: { fullName?: string },
  ): Promise<UserResponseDto> {
    const entity = await this.upsertProfile.execute({
      supabaseId: user.sub,
      email: user.email,
      fullName:
        body.fullName ??
        (user['user_metadata'] as Record<string, string> | undefined)?.[
          'full_name'
        ],
    });
    return UserResponseDto.fromDomain(entity);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Listar todos los usuarios' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.getAllUsers.execute();
    return users.map((u) => UserResponseDto.fromDomain(u));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Obtener usuario por ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const entity = await this.getUserById.execute(id);
    return UserResponseDto.fromDomain(entity);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Cambiar rol de un usuario' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async changeRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<UserResponseDto> {
    const entity = await this.updateUserRole.execute({
      userId: id,
      role: dto.role,
      requestingUserId: currentUser.sub,
    });
    return UserResponseDto.fromDomain(entity);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[ADMIN] Eliminar usuario' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<void> {
    if (id === currentUser.sub) {
      throw new Error('No puedes eliminar tu propio usuario');
    }
    await this.userRepo.delete(id);
  }
}
