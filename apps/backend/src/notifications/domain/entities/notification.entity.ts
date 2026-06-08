import { NotificationType } from '../value-objects/notification-type.vo';

/**
 * Notificación in-app dirigida a un usuario concreto. La carga útil
 * es JSON libre para no acoplar el dominio de notificaciones a la
 * forma exacta de cada evento (reserva, recordatorio…).
 */
export class NotificationEntity {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _type: NotificationType;
  private readonly _title: string;
  private readonly _body: string;
  private readonly _payload: Record<string, unknown>;
  private _readAt: Date | null;
  private readonly _createdAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    type: NotificationType | string;
    title: string;
    body: string;
    payload?: Record<string, unknown>;
    readAt?: Date | null;
    createdAt?: Date;
  }) {
    this._id = props.id;
    this._userId = props.userId;
    this._type = props.type as NotificationType;
    this._title = props.title;
    this._body = props.body;
    this._payload = props.payload ?? {};
    this._readAt = props.readAt ?? null;
    this._createdAt = props.createdAt ?? new Date();
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get type(): NotificationType {
    return this._type;
  }
  get title(): string {
    return this._title;
  }
  get body(): string {
    return this._body;
  }
  get payload(): Record<string, unknown> {
    return this._payload;
  }
  get readAt(): Date | null {
    return this._readAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  isRead(): boolean {
    return this._readAt !== null;
  }

  markAsRead(at: Date = new Date()): void {
    if (this._readAt) return;
    this._readAt = at;
  }

  belongsTo(userId: string): boolean {
    return this._userId === userId;
  }
}
