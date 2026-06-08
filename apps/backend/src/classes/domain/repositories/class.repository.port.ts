import { ClassEntity } from '../entities/class.entity';
import { ClassCategory } from '../value-objects/class-category.vo';

export interface CreateClassData {
  instructorId: string;
  name: string;
  description?: string | null;
  category: ClassCategory;
  dayOfWeek: number;
  startTime: string;
  durationMin: number;
  capacity: number;
  location?: string | null;
}

export abstract class ClassRepositoryPort {
  abstract findById(id: string): Promise<ClassEntity | null>;
  abstract findAll(opts?: { activeOnly?: boolean }): Promise<ClassEntity[]>;
  abstract findByInstructor(instructorId: string): Promise<ClassEntity[]>;
  abstract findActiveByDayOfWeek(dayOfWeek: number): Promise<ClassEntity[]>;
  abstract create(data: CreateClassData): Promise<ClassEntity>;
  abstract save(entity: ClassEntity): Promise<ClassEntity>;
}

export const CLASS_REPOSITORY = Symbol('CLASS_REPOSITORY');
