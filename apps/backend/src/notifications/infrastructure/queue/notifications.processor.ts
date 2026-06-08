import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { NOTIFICATIONS_QUEUE_NAME } from './queue-tokens';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../../domain/repositories/notification.repository.port';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';
import { MAILER, MailerPort } from '../../application/services/mailer';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/repositories/user.repository.port';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../../../classes/domain/repositories/booking.repository.port';
import {
  CLASS_SESSION_REPOSITORY,
  ClassSessionRepositoryPort,
} from '../../../classes/domain/repositories/class-session.repository.port';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../../classes/domain/repositories/class.repository.port';
import {
  madridDayRangeUtc,
  todayDayOfWeekInMadrid,
} from '../../../classes/application/services/madrid-time';

interface BookingJobData {
  type: 'booking-confirmed' | 'booking-promoted';
  userId: string;
  bookingId: string;
  sessionId: string;
  classId: string;
  className: string;
  scheduledAt: string | Date;
}

@Processor(NOTIFICATIONS_QUEUE_NAME)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger('NotificationsProcessor');

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepositoryPort,
    @Inject(MAILER) private readonly mailer: MailerPort,
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookings: BookingRepositoryPort,
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly sessions: ClassSessionRepositoryPort,
    @Inject(CLASS_REPOSITORY) private readonly classes: ClassRepositoryPort,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'booking-confirmed':
        return this.handleBookingConfirmed(job.data as BookingJobData);
      case 'booking-promoted':
        return this.handleBookingPromoted(job.data as BookingJobData);
      case 'daily-reminder':
        return this.handleDailyReminder();
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async handleBookingConfirmed(data: BookingJobData): Promise<void> {
    const at = new Date(data.scheduledAt);
    const time = at.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid',
    });
    await this.notifications.create({
      userId: data.userId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: `Plaza confirmada: ${data.className}`,
      body: `Tu reserva para ${data.className} hoy a las ${time} está confirmada.`,
      payload: {
        bookingId: data.bookingId,
        sessionId: data.sessionId,
        classId: data.classId,
      },
    });

    const user = await this.users.findById(data.userId);
    if (user) {
      await this.mailer.send({
        to: user.email,
        subject: `Plaza confirmada — ${data.className}`,
        body: `Hola ${user.fullName ?? ''},\n\nTu plaza en ${data.className} hoy a las ${time} está confirmada.\n\n¡Nos vemos en el gimnasio!`,
      });
    }
  }

  private async handleBookingPromoted(data: BookingJobData): Promise<void> {
    const at = new Date(data.scheduledAt);
    const time = at.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid',
    });
    await this.notifications.create({
      userId: data.userId,
      type: NotificationType.BOOKING_PROMOTED,
      title: `Has subido desde lista de espera: ${data.className}`,
      body: `Una plaza ha quedado libre en ${data.className} (hoy a las ${time}). Estás dentro.`,
      payload: {
        bookingId: data.bookingId,
        sessionId: data.sessionId,
        classId: data.classId,
      },
    });

    const user = await this.users.findById(data.userId);
    if (user) {
      await this.mailer.send({
        to: user.email,
        subject: `¡Plaza libre! — ${data.className}`,
        body: `Hola ${user.fullName ?? ''},\n\nHas subido de la lista de espera. Tu plaza en ${data.className} hoy a las ${time} está confirmada.`,
      });
    }
  }

  /**
   * Recorre las sesiones de hoy, agrupa por usuario con reserva
   * confirmada y crea una notificación por usuario con la lista de
   * sus clases del día. Idempotencia básica: solo creamos una
   * notificación de tipo DAILY_REMINDER por (user, día) — comprobamos
   * que no exista otra creada hoy.
   */
  private async handleDailyReminder(): Promise<void> {
    const now = new Date();
    const dow = todayDayOfWeekInMadrid(now);
    const todaysClasses = await this.classes.findActiveByDayOfWeek(dow);
    if (todaysClasses.length === 0) return;

    const { fromUtc, toUtc } = madridDayRangeUtc(now);
    const sessions = await this.sessions.findInRange({
      fromUtc,
      toUtc,
      classIds: todaysClasses.map((c) => c.id),
    });
    if (sessions.length === 0) return;

    const classById = new Map(todaysClasses.map((c) => [c.id, c]));

    // Para cada sesión, traemos sus bookings confirmadas y agrupamos por usuario.
    const userClasses = new Map<string, { name: string; at: Date }[]>();
    for (const s of sessions) {
      const klass = classById.get(s.classId);
      if (!klass) continue;
      const bookings = await this.bookings.findActiveBySession(s.id);
      for (const b of bookings.filter((x) => x.isConfirmed())) {
        const list = userClasses.get(b.userId) ?? [];
        list.push({ name: klass.name, at: s.scheduledAt });
        userClasses.set(b.userId, list);
      }
    }

    for (const [userId, list] of userClasses) {
      const sorted = list.sort((a, b) => a.at.getTime() - b.at.getTime());
      const lines = sorted
        .map(
          (i) =>
            `• ${i.at.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })} — ${i.name}`,
        )
        .join('\n');

      await this.notifications.create({
        userId,
        type: NotificationType.DAILY_REMINDER,
        title: `Tus clases de hoy (${sorted.length})`,
        body: lines,
        payload: { count: sorted.length },
      });

      const user = await this.users.findById(userId);
      if (user) {
        await this.mailer.send({
          to: user.email,
          subject: 'Tus clases de hoy',
          body: `Buenos días ${user.fullName ?? ''},\n\nEste es el resumen de tus clases para hoy:\n\n${lines}\n\n¡Buen entrenamiento!`,
        });
      }
    }

    this.logger.log(
      `Daily reminder fan-out: ${userClasses.size} usuarios notificados`,
    );
  }
}
