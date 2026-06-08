import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/repositories/user.repository.port';
import { ClassEntity } from '../../domain/entities/class.entity';
import { ClassCategory } from '../../domain/value-objects/class-category.vo';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';
import {
  NOTIFICATIONS_QUEUE,
  NotificationsQueuePort,
} from '../../../notifications/application/services/notifications-queue.port';

export interface CreateClassCommand {
  requestingUserId: string;
  requestingUserRole: UserRole;
  name: string;
  description?: string | null;
  category: ClassCategory | string;
  dayOfWeek: number;
  startTime: string;
  durationMin: number;
  capacity: number;
  location?: string | null;
  /** Solo se respeta cuando el caller es ADMIN; en caso contrario el caller es el instructor. */
  instructorId?: string;
}

@Injectable()
export class CreateClassUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly repo: ClassRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(NOTIFICATIONS_QUEUE)
    private readonly queue: NotificationsQueuePort,
  ) {}

  async execute(cmd: CreateClassCommand): Promise<ClassEntity> {
    const instructorId = await this.resolveInstructorId(cmd);

    // Domain entity validates inputs; repository persists.
    const probe = new ClassEntity({
      id: '00000000-0000-0000-0000-000000000000',
      instructorId,
      name: cmd.name,
      description: cmd.description,
      category: cmd.category as ClassCategory,
      dayOfWeek: cmd.dayOfWeek,
      startTime: cmd.startTime,
      durationMin: cmd.durationMin,
      capacity: cmd.capacity,
      location: cmd.location,
    });

    const created = await this.repo.create({
      instructorId: probe.instructorId,
      name: probe.name,
      description: probe.description,
      category: probe.category,
      dayOfWeek: probe.dayOfWeek,
      startTime: probe.startTime,
      durationMin: probe.durationMin,
      capacity: probe.capacity,
      location: probe.location,
    });

    // Notify the instructor when an admin assigned them this class.
    if (instructorId !== cmd.requestingUserId) {
      void this.queue.enqueue({
        type: 'class-assigned',
        userId: instructorId,
        assignedByUserId: cmd.requestingUserId,
        classId: created.id,
        className: created.name,
        dayOfWeek: created.dayOfWeek,
        startTime: created.startTime,
      });
    }

    return created;
  }

  private async resolveInstructorId(cmd: CreateClassCommand): Promise<string> {
    if (!cmd.instructorId || cmd.instructorId === cmd.requestingUserId) {
      return cmd.requestingUserId;
    }
    if (cmd.requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo un administrador puede asignar la clase a otro instructor',
      );
    }
    const target = await this.users.findById(cmd.instructorId);
    if (!target) {
      throw new NotFoundException(
        `Instructor ${cmd.instructorId} no encontrado`,
      );
    }
    if (!target.role.isInstructor() && !target.role.isAdmin()) {
      throw new BadRequestException(
        'El usuario asignado debe tener el rol de instructor o admin',
      );
    }
    return target.id;
  }
}
