/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookSessionUseCase } from './book-session.use-case';
import { ClassRepositoryPort } from '../../domain/repositories/class.repository.port';
import { ClassSessionRepositoryPort } from '../../domain/repositories/class-session.repository.port';
import { BookingRepositoryPort } from '../../domain/repositories/booking.repository.port';
import { ClassEntity } from '../../domain/entities/class.entity';
import { ClassSessionEntity } from '../../domain/entities/class-session.entity';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { ClassCategory } from '../../domain/value-objects/class-category.vo';
import { BookingStatus } from '../../domain/value-objects/booking-status.vo';
import { NotificationsQueuePort } from '../../../notifications/application/services/notifications-queue.port';

function mkQueue(): jest.Mocked<NotificationsQueuePort> {
  return {
    enqueue: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<NotificationsQueuePort>;
}

// "Now": Mon 2026-06-15 10:00 Madrid (CEST, UTC+2) = 08:00 UTC.
const NOW = new Date('2026-06-15T08:00:00Z');
// Today's session at 19:00 Madrid = 17:00 UTC.
const TODAY_19 = new Date('2026-06-15T17:00:00Z');
// Tomorrow's session at 19:00 Madrid.
const TOMORROW_19 = new Date('2026-06-16T17:00:00Z');

const klass = new ClassEntity({
  id: 'class-1',
  instructorId: 'instructor-1',
  name: 'Spinning',
  category: ClassCategory.CYCLING,
  dayOfWeek: 1,
  startTime: '19:00',
  durationMin: 60,
  capacity: 2,
});

function mkSession(
  scheduledAt: Date,
  status: 'scheduled' | 'cancelled' | 'completed' = 'scheduled',
) {
  return new ClassSessionEntity({
    id: 'session-1',
    classId: klass.id,
    scheduledAt,
    status: status as never,
  });
}

function mkBookings(
  overrides: Partial<BookingRepositoryPort> = {},
): jest.Mocked<BookingRepositoryPort> {
  return {
    findById: jest.fn(),
    findActiveBySessionAndUser: jest.fn(),
    findActiveBySession: jest.fn(),
    findActiveByUser: jest.fn(),
    countsBySession: jest.fn(),
    findUserBookingsForSessions: jest.fn(),
    bookAtomically: jest.fn(),
    cancelAtomically: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<BookingRepositoryPort>;
}

function mkClasses(
  found: ClassEntity | null,
): jest.Mocked<ClassRepositoryPort> {
  return {
    findById: jest.fn().mockResolvedValue(found),
    findAll: jest.fn(),
    findByInstructor: jest.fn(),
    findActiveByDayOfWeek: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<ClassRepositoryPort>;
}

function mkSessions(
  found: ClassSessionEntity | null,
): jest.Mocked<ClassSessionRepositoryPort> {
  return {
    findById: jest.fn().mockResolvedValue(found),
    upsertScheduledSession: jest.fn(),
    findInRange: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<ClassSessionRepositoryPort>;
}

describe('BookSessionUseCase', () => {
  it('rejects when session does not exist', async () => {
    const uc = new BookSessionUseCase(
      mkBookings(),
      mkClasses(klass),
      mkSessions(null),
      mkQueue(),
    );
    await expect(
      uc.execute({ sessionId: 's', userId: 'u', now: NOW }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects when session is cancelled', async () => {
    const session = mkSession(TODAY_19, 'cancelled');
    const uc = new BookSessionUseCase(
      mkBookings(),
      mkClasses(klass),
      mkSessions(session),
      mkQueue(),
    );
    await expect(
      uc.execute({ sessionId: 's', userId: 'u', now: NOW }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the class has already started', async () => {
    const session = mkSession(NOW); // start time = now
    const uc = new BookSessionUseCase(
      mkBookings(),
      mkClasses(klass),
      mkSessions(session),
      mkQueue(),
    );
    await expect(
      uc.execute({ sessionId: 's', userId: 'u', now: NOW }),
    ).rejects.toThrow(/comenzado/);
  });

  it('rejects when the session is not today (same-day rule)', async () => {
    const session = mkSession(TOMORROW_19);
    const uc = new BookSessionUseCase(
      mkBookings(),
      mkClasses(klass),
      mkSessions(session),
      mkQueue(),
    );
    await expect(
      uc.execute({ sessionId: 's', userId: 'u', now: NOW }),
    ).rejects.toThrow(/mismo día/);
  });

  it('rejects when the class is inactive', async () => {
    const session = mkSession(TODAY_19);
    const inactive = new ClassEntity({
      ...klass.toPlainObject(),
      active: false,
    });
    const uc = new BookSessionUseCase(
      mkBookings(),
      mkClasses(inactive),
      mkSessions(session),
      mkQueue(),
    );
    await expect(
      uc.execute({ sessionId: 's', userId: 'u', now: NOW }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('delegates atomic booking with the session capacity', async () => {
    const session = mkSession(TODAY_19);
    const bookings = mkBookings();
    bookings.bookAtomically.mockResolvedValue({
      booking: new BookingEntity({
        id: 'b1',
        sessionId: 'session-1',
        userId: 'u',
        status: BookingStatus.CONFIRMED,
        position: null,
      }),
      status: BookingStatus.CONFIRMED,
      position: null,
    });
    const uc = new BookSessionUseCase(
      bookings,
      mkClasses(klass),
      mkSessions(session),
      mkQueue(),
    );

    const result = await uc.execute({
      sessionId: 'session-1',
      userId: 'u',
      now: NOW,
    });
    expect(bookings.bookAtomically).toHaveBeenCalledWith({
      sessionId: 'session-1',
      userId: 'u',
      capacity: 2,
    });
    expect(result.status).toBe(BookingStatus.CONFIRMED);
  });

  it('uses session capacity_override when set', async () => {
    const session = new ClassSessionEntity({
      id: 'session-1',
      classId: klass.id,
      scheduledAt: TODAY_19,
      capacityOverride: 5,
    });
    const bookings = mkBookings();
    bookings.bookAtomically.mockResolvedValue({
      booking: new BookingEntity({
        id: 'b1',
        sessionId: 'session-1',
        userId: 'u',
      }),
      status: BookingStatus.CONFIRMED,
      position: null,
    });
    const uc = new BookSessionUseCase(
      bookings,
      mkClasses(klass),
      mkSessions(session),
      mkQueue(),
    );

    await uc.execute({ sessionId: 'session-1', userId: 'u', now: NOW });

    expect(bookings.bookAtomically).toHaveBeenCalledWith(
      expect.objectContaining({ capacity: 5 }),
    );
  });
});
