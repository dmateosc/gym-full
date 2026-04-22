import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort, USER_REPOSITORY } from '../../domain/repositories/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';

/**
 * Caso de uso: Obtener todos los usuarios.
 * Solo accesible para ADMIN.
 */
@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }
}
