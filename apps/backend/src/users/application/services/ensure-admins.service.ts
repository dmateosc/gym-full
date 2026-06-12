import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/repositories/user.repository.port';
import { UserRole } from '../../domain/value-objects/user-role.vo';

/**
 * Bootstrap declarativo del rol admin.
 *
 * Si la variable `INITIAL_ADMIN_EMAILS` está definida (lista separada
 * por comas), al arrancar el backend asegura que cada uno de esos
 * usuarios tiene el rol `admin` — siempre que el perfil exista ya
 * en `user_profiles`. Si el email todavía no se ha registrado, se
 * salta sin error y se vuelve a intentar en el siguiente arranque.
 *
 * Es idempotente: si el usuario ya es admin, no hace nada.
 *
 * Útil para reprovisión completa o levantar el stack en otro homelab
 * sin tener que ejecutar UPDATEs a mano.
 */
@Injectable()
export class EnsureAdminsService implements OnApplicationBootstrap {
  private readonly logger = new Logger('EnsureAdminsService');

  constructor(
    private readonly config: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const raw = this.config.get<string>('INITIAL_ADMIN_EMAILS');
    if (!raw) return;

    const emails = raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);
    if (emails.length === 0) return;

    let promoted = 0;
    let skipped = 0;
    let already = 0;

    for (const email of emails) {
      try {
        const user = await this.users.findByEmail(email);
        if (!user) {
          skipped++;
          continue;
        }
        if (user.role.value === UserRole.ADMIN) {
          already++;
          continue;
        }
        await this.users.updateRole(user.id, UserRole.ADMIN);
        promoted++;
      } catch (err) {
        this.logger.error(
          `Error promoviendo ${email}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `INITIAL_ADMIN_EMAILS aplicado — promovidos: ${promoted}, ya admin: ${already}, sin perfil aún: ${skipped}`,
    );
  }
}
