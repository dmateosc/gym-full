import { BookingStatus } from '../value-objects/booking-status.vo';

/**
 * Reserva de un usuario sobre una sesión concreta de clase.
 *
 * - `position` solo es relevante mientras la reserva está en
 *   `waitlist` (1 = primer candidato a promoción).
 * - Cancelar es irreversible para esta fila. Una nueva reserva del
 *   mismo usuario sobre la misma sesión es una fila nueva.
 */
export class BookingEntity {
  private readonly _id: string;
  private readonly _sessionId: string;
  private readonly _userId: string;
  private _status: BookingStatus;
  private _position: number | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    sessionId: string;
    userId: string;
    status?: BookingStatus | string;
    position?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._sessionId = props.sessionId;
    this._userId = props.userId;
    this._status = (props.status ?? BookingStatus.CONFIRMED) as BookingStatus;
    this._position = props.position ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string {
    return this._id;
  }
  get sessionId(): string {
    return this._sessionId;
  }
  get userId(): string {
    return this._userId;
  }
  get status(): BookingStatus {
    return this._status;
  }
  get position(): number | null {
    return this._position;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  isConfirmed(): boolean {
    return this._status === BookingStatus.CONFIRMED;
  }

  isWaitlist(): boolean {
    return this._status === BookingStatus.WAITLIST;
  }

  isCancelled(): boolean {
    return this._status === BookingStatus.CANCELLED;
  }

  isActive(): boolean {
    return this._status !== BookingStatus.CANCELLED;
  }

  belongsTo(userId: string): boolean {
    return this._userId === userId;
  }

  /** Promueve una reserva de waitlist a confirmed (cuando una plaza queda libre). */
  promoteToConfirmed(): void {
    if (this._status !== BookingStatus.WAITLIST) {
      throw new Error('Solo se promueven reservas en lista de espera');
    }
    this._status = BookingStatus.CONFIRMED;
    this._position = null;
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === BookingStatus.CANCELLED) return;
    this._status = BookingStatus.CANCELLED;
    this._position = null;
    this._updatedAt = new Date();
  }

  toPlainObject() {
    return {
      id: this._id,
      sessionId: this._sessionId,
      userId: this._userId,
      status: this._status,
      position: this._position,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
