import { Inject, Injectable } from '@nestjs/common';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import {
  CLASS_SESSION_REPOSITORY,
  ClassSessionRepositoryPort,
} from '../../domain/repositories/class-session.repository.port';
import { ClassEntity } from '../../domain/entities/class.entity';
import { ClassSessionEntity } from '../../domain/entities/class-session.entity';
import {
  madridDayRangeUtc,
  madridLocalToUtc,
  todayDayOfWeekInMadrid,
} from '../services/madrid-time';

export interface TodaySessionView {
  session: ClassSessionEntity;
  klass: ClassEntity;
}

/**
 * Returns today's class sessions in Madrid time. Sessions are
 * materialised on demand: for every active class scheduled for today's
 * weekday we UPSERT a ClassSession at the corresponding wall-clock
 * time. The unique (class_id, scheduled_at) constraint makes the
 * UPSERT idempotent so concurrent requests don't duplicate rows.
 */
@Injectable()
export class ListTodaySessionsUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepo: ClassRepositoryPort,
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly sessionRepo: ClassSessionRepositoryPort,
  ) {}

  async execute(now: Date = new Date()): Promise<TodaySessionView[]> {
    const dow = todayDayOfWeekInMadrid(now);
    const todaysClasses = await this.classRepo.findActiveByDayOfWeek(dow);
    if (todaysClasses.length === 0) return [];

    // Materialise (idempotent) one session per class for today.
    await Promise.all(
      todaysClasses.map((klass) =>
        this.sessionRepo.upsertScheduledSession({
          classId: klass.id,
          scheduledAt: madridLocalToUtc(klass.startTime, now),
        }),
      ),
    );

    const { fromUtc, toUtc } = madridDayRangeUtc(now);
    const sessions = await this.sessionRepo.findInRange({
      fromUtc,
      toUtc,
      classIds: todaysClasses.map((c) => c.id),
    });

    const classById = new Map(todaysClasses.map((c) => [c.id, c]));
    return sessions
      .filter((s) => classById.has(s.classId))
      .map((session) => ({ session, klass: classById.get(session.classId)! }));
  }
}
