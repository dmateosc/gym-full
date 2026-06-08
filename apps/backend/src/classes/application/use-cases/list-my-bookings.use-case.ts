import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../../domain/repositories/booking.repository.port';
import {
  CLASS_SESSION_REPOSITORY,
  ClassSessionRepositoryPort,
} from '../../domain/repositories/class-session.repository.port';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { ClassEntity } from '../../domain/entities/class.entity';
import { ClassSessionEntity } from '../../domain/entities/class-session.entity';

export interface MyBookingView {
  booking: BookingEntity;
  session: ClassSessionEntity;
  klass: ClassEntity;
}

@Injectable()
export class ListMyBookingsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookings: BookingRepositoryPort,
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly sessions: ClassSessionRepositoryPort,
    @Inject(CLASS_REPOSITORY)
    private readonly classes: ClassRepositoryPort,
  ) {}

  async execute(userId: string): Promise<MyBookingView[]> {
    const bookings = await this.bookings.findActiveByUser(userId);
    if (bookings.length === 0) return [];

    const sessionIds = Array.from(new Set(bookings.map((b) => b.sessionId)));
    const sessions = await Promise.all(
      sessionIds.map((id) => this.sessions.findById(id)),
    );
    const sessionById = new Map<string, ClassSessionEntity>();
    for (const s of sessions) {
      if (s) sessionById.set(s.id, s);
    }

    const classIds = Array.from(
      new Set(Array.from(sessionById.values()).map((s) => s.classId)),
    );
    const classes = await Promise.all(
      classIds.map((id) => this.classes.findById(id)),
    );
    const classById = new Map<string, ClassEntity>();
    for (const c of classes) {
      if (c) classById.set(c.id, c);
    }

    const views: MyBookingView[] = [];
    for (const b of bookings) {
      const s = sessionById.get(b.sessionId);
      if (!s) continue;
      const k = classById.get(s.classId);
      if (!k) continue;
      views.push({ booking: b, session: s, klass: k });
    }
    // Future/today sessions first, then most recent.
    views.sort(
      (a, b) =>
        a.session.scheduledAt.getTime() - b.session.scheduledAt.getTime(),
    );
    return views;
  }
}
