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
import { ClassEntity } from '../../domain/entities/class.entity';
import { ClassCategory } from '../../domain/value-objects/class-category.vo';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';

export interface UpdateClassCommand {
  id: string;
  requestingUserId: string;
  requestingUserRole: UserRole;
  name?: string;
  description?: string | null;
  category?: ClassCategory | string;
  dayOfWeek?: number;
  startTime?: string;
  durationMin?: number;
  capacity?: number;
  location?: string | null;
  active?: boolean;
}

@Injectable()
export class UpdateClassUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly repo: ClassRepositoryPort,
  ) {}

  async execute(cmd: UpdateClassCommand): Promise<ClassEntity> {
    const entity = await this.repo.findById(cmd.id);
    if (!entity) throw new NotFoundException(`Clase ${cmd.id} no encontrada`);

    if (
      cmd.requestingUserRole !== UserRole.ADMIN &&
      !entity.belongsTo(cmd.requestingUserId)
    ) {
      throw new ForbiddenException('Solo el instructor propietario puede modificar esta clase');
    }

    if (cmd.name !== undefined) entity.rename(cmd.name);

    if (
      cmd.dayOfWeek !== undefined ||
      cmd.startTime !== undefined ||
      cmd.durationMin !== undefined
    ) {
      entity.changeSchedule(
        cmd.dayOfWeek ?? entity.dayOfWeek,
        cmd.startTime ?? entity.startTime,
        cmd.durationMin ?? entity.durationMin,
      );
    }

    if (cmd.capacity !== undefined) entity.setCapacity(cmd.capacity);

    if (
      cmd.description !== undefined ||
      cmd.category !== undefined ||
      cmd.location !== undefined
    ) {
      entity.updateDetails({
        description: cmd.description,
        category: cmd.category,
        location: cmd.location,
      });
    }

    if (cmd.active !== undefined) {
      cmd.active ? entity.activate() : entity.deactivate();
    }

    return this.repo.save(entity);
  }
}
