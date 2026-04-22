import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort, USER_REPOSITORY } from '../../domain/repositories/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async executeBySupabaseId(supabaseId: string): Promise<UserEntity | null> {
    return this.userRepository.findBySupabaseId(supabaseId);
  }
}
