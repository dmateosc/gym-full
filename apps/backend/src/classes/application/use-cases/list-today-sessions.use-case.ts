import { Inject, Injectable } from '@nestjs/common';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import {
  CLASS_SESSION_REPOSITORY,
  ClassSessionRepositoryPort,
} from '../../domain/repositories/class-session.repository.port';
import {
  BOOKING_REPOSITORY,
  BookingCounts,
  BookingRepositoryPort,
} from '../../domain/repositories/booking.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/repositories/user.repository.port';
import { ClassEntity } from '../../domain/entities/class.entity';
import { ClassSessionEntity } from '../../domain/entities/class-session.entity';
import { BookingEntity } from '../../domain/entities/booking.entity';
import {
  madridDayRangeUtc,
  madridLocalToUtc,
  todayDayOfWeekInMadrid,
} from '../services/madrid-time';

export interface TodaySessionView {
  session: ClassSessionEntity;
  klass: ClassEntity;
  counts: BookingCounts;
  myBooking: BookingEntity | null;
  instructorName: string | null;
}

/**
 * Today's class sessions (Madrid time) with materialisation, booking
 * counts per session, and (when a userId is provided) the user's own
 * active booking on each session.
 */
@Injectable()
export class ListTodaySessionsUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepo: ClassRepositoryPort,
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly sessionRepo: ClassSessionRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(
    opts: { userId?: string; now?: Date } = {},
  ): Promise<TodaySessionView[]> {
    const now = opts.now ?? new Date();
    const dow = todayDayOfWeekInMadrid(now);
    const todaysClasses = await this.classRepo.findActiveByDayOfWeek(dow);
    if (todaysClasses.length === 0) return [];

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

    const sessionIds = sessions.map((s) => s.id);
    const counts = await this.bookingRepo.countsBySession(sessionIds);
    const myBookings = opts.userId
      ? await this.bookingRepo.findUserBookingsForSessions(
          opts.userId,
          sessionIds,
        )
      : [];
    const myBookingBySession = new Map<string, BookingEntity>();
    for (const b of myBookings) {
      if (!b.isCancelled()) myBookingBySession.set(b.sessionId, b);
    }

    // Resolve instructor names in one pass per unique instructor.
    const instructorIds = Array.from(
      new Set(todaysClasses.map((c) => c.instructorId)),
    );
    const instructors = await Promise.all(
      instructorIds.map((id) => this.userRepo.findById(id)),
    );
    const nameById = new Map<string, string>();
    for (const u of instructors) {
      if (u) nameById.set(u.id, u.fullName ?? u.email);
    }

    const classById = new Map(todaysClasses.map((c) => [c.id, c]));
    return sessions
      .filter((s) => classById.has(s.classId))
      .map((session) => {
        const klass = classById.get(session.classId)!;
        return {
          session,
          klass,
          counts: counts.get(session.id) ?? { confirmed: 0, waitlist: 0 },
          myBooking: myBookingBySession.get(session.id) ?? null,
          instructorName: nameById.get(klass.instructorId) ?? null,
        };
      });
  }
}
