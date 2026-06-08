import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';

@Injectable()
export class SoftDeleteClassUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly repo: ClassRepositoryPort,
  ) {}

  async execute(cmd: {
    id: string;
    requestingUserId: string;
    requestingUserRole: UserRole;
  }): Promise<void> {
    const entity = await this.repo.findById(cmd.id);
    if (!entity) throw new NotFoundException(`Clase ${cmd.id} no encontrada`);

    if (
      cmd.requestingUserRole !== UserRole.ADMIN &&
      !entity.belongsTo(cmd.requestingUserId)
    ) {
      throw new ForbiddenException('Solo el instructor propietario puede eliminar esta clase');
    }

    if (!entity.isActive()) return; // idempotente
    entity.deactivate();
    await this.repo.save(entity);
  }
}
