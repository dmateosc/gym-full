import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort, USER_REPOSITORY } from '../../domain/repositories/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';

export interface UpsertUserProfileCommand {
  supabaseId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

/**
 * Caso de uso: Crear o actualizar perfil de usuario.
 * Se llama al hacer login por primera vez (se crea el perfil si no existe).
 */
@Injectable()
export class UpsertUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: UpsertUserProfileCommand): Promise<UserEntity> {
    return this.userRepository.upsert({
      supabaseId: command.supabaseId,
      email: command.email,
      fullName: command.fullName,
      avatarUrl: command.avatarUrl,
    });
  }
}
