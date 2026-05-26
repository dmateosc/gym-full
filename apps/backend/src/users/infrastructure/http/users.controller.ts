import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
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

import { JwtAuthGuard, JwtPayload } from '../../../auth/application/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/application/guards/roles.guard';
import { Roles } from '../../../auth/application/decorators/roles.decorator';
import { UserRole } from '../../../auth/application/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/application/decorators/current-user.decorator';

import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { UpsertUserProfileUseCase } from '../../application/use-cases/upsert-user-profile.use-case';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserRole as DomainUserRole } from '../../domain/value-objects/user-role.vo';

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
  ) {}

  /**
   * Obtener el perfil del usuario autenticado.
   * user.sub es nuestro ID interno de la BD.
   */
  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getMyProfile(@CurrentUser() user: JwtPayload): Promise<UserResponseDto | null> {
    const entity = await this.getUserById.execute(user.sub);
    if (!entity) return null;
    return UserResponseDto.fromDomain(entity);
  }

  /**
   * Listar todos los usuarios. Solo ADMIN.
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Listar todos los usuarios' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.getAllUsers.execute();
    return users.map(UserResponseDto.fromDomain);
  }

  /**
   * Obtener usuario por ID. Solo ADMIN.
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Obtener usuario por ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const entity = await this.getUserById.execute(id);
    return UserResponseDto.fromDomain(entity);
  }

  /**
   * Cambiar rol de usuario. Solo ADMIN.
   */
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
      role: dto.role as DomainUserRole,
      requestingUserId: currentUser.sub,
    });
    return UserResponseDto.fromDomain(entity);
  }

  /**
   * Eliminar usuario. Solo ADMIN.
   */
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
    const entity = await this.getUserById.execute(id);
    await this.upsertProfile['userRepository']?.delete?.(entity.id);
  }
}
