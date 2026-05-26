import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, UserRepositoryPort } from '../../../users/domain/repositories/user.repository.port';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string): Promise<{ token: string; user: Record<string, unknown> }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role.value,
    });

    return { token, user: user.toPlainObject() };
  }
}
