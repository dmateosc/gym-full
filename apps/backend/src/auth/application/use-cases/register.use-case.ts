import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, UserRepositoryPort } from '../../../users/domain/repositories/user.repository.port';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string, fullName?: string): Promise<{ token: string; user: Record<string, unknown> }> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepo.create({ email, passwordHash, fullName });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role.value,
    });

    return { token, user: user.toPlainObject() };
  }
}
