import { BadRequestException, Injectable } from '@nestjs/common';
import { ClassEntity } from '../../domain/entities/class.entity';
import { ClassCategory } from '../../domain/value-objects/class-category.vo';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';
import { CreateClassUseCase } from './create-class.use-case';

export interface BulkCreateClassesCommand {
  requestingUserId: string;
  requestingUserRole: UserRole;
  name: string;
  description?: string | null;
  category: ClassCategory | string;
  daysOfWeek: number[];
  startTime: string;
  durationMin: number;
  capacity: number;
  location?: string | null;
  instructorId?: string;
}

/**
 * Crea N clases (una por día seleccionado) reusando el use case de
 * creación individual. La validación de cada día (instructorId,
 * conflictos, etc.) la hace `CreateClassUseCase`. Si un día falla los
 * anteriores ya se habrán creado; el caller debe tratarlas como
 * "creación parcial" si recibe error.
 */
@Injectable()
export class BulkCreateClassesUseCase {
  constructor(private readonly createOne: CreateClassUseCase) {}

  async execute(cmd: BulkCreateClassesCommand): Promise<ClassEntity[]> {
    const days = Array.from(new Set(cmd.daysOfWeek)).sort((a, b) => a - b);
    if (days.length === 0) {
      throw new BadRequestException('Debes elegir al menos un día');
    }

    const created: ClassEntity[] = [];
    for (const dayOfWeek of days) {
      const entity = await this.createOne.execute({
        requestingUserId: cmd.requestingUserId,
        requestingUserRole: cmd.requestingUserRole,
        name: cmd.name,
        description: cmd.description,
        category: cmd.category,
        dayOfWeek,
        startTime: cmd.startTime,
        durationMin: cmd.durationMin,
        capacity: cmd.capacity,
        location: cmd.location,
        instructorId: cmd.instructorId,
      });
      created.push(entity);
    }
    return created;
  }
}
