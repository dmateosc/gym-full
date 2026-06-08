import { ClassSessionEntity } from '../entities/class-session.entity';

export interface UpsertSessionData {
  classId: string;
  scheduledAt: Date;
}

export abstract class ClassSessionRepositoryPort {
  abstract findById(id: string): Promise<ClassSessionEntity | null>;
  /**
   * Idempotent upsert keyed by (class_id, scheduled_at). Used to
   * materialise today's sessions on demand without duplicating rows.
   */
  abstract upsertScheduledSession(
    data: UpsertSessionData,
  ): Promise<ClassSessionEntity>;
  abstract findInRange(opts: {
    fromUtc: Date;
    toUtc: Date;
    classIds?: string[];
  }): Promise<ClassSessionEntity[]>;
  abstract save(entity: ClassSessionEntity): Promise<ClassSessionEntity>;
}

export const CLASS_SESSION_REPOSITORY = Symbol('CLASS_SESSION_REPOSITORY');
