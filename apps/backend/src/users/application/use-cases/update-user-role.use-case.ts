import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepositoryPort, USER_REPOSITORY } from '../../domain/repositories/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/value-objects/user-role.vo';

export interface UpdateUserRoleCommand {
  userId: string;
  role: UserRole;
  requestingUserId: string; // quien hace la petición (debe ser admin)
}

/**
 * Caso de uso: Cambiar el rol de un usuario.
 * Solo ejecutable por administradores.
 */
@Injectable()
export class UpdateUserRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: UpdateUserRoleCommand): Promise<UserEntity> {
    // No se puede cambiar el propio rol
    if (command.userId === command.requestingUserId) {
      throw new BadRequestException('No puedes cambiar tu propio rol');
    }

    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`Usuario ${command.userId} no encontrado`);
    }

    return this.userRepository.updateRole(command.userId, command.role);
  }
}
