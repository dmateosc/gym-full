import { ClassSessionStatus } from '../value-objects/class-session-status.vo';

/**
 * Ocurrencia concreta de una ClassEntity en una fecha+hora.
 * Las reservas (PR siguiente) apuntan aquí.
 */
export class ClassSessionEntity {
  private readonly _id: string;
  private readonly _classId: string;
  private readonly _scheduledAt: Date;
  private _capacityOverride: number | null;
  private _status: ClassSessionStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    classId: string;
    scheduledAt: Date;
    capacityOverride?: number | null;
    status?: ClassSessionStatus | string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._classId = props.classId;
    this._scheduledAt = props.scheduledAt;
    this._capacityOverride = props.capacityOverride ?? null;
    this._status = (props.status ?? ClassSessionStatus.SCHEDULED) as ClassSessionStatus;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string { return this._id; }
  get classId(): string { return this._classId; }
  get scheduledAt(): Date { return this._scheduledAt; }
  get capacityOverride(): number | null { return this._capacityOverride; }
  get status(): ClassSessionStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  effectiveCapacity(classCapacity: number): number {
    return this._capacityOverride ?? classCapacity;
  }

  cancel(): void {
    if (this._status === ClassSessionStatus.COMPLETED) {
      throw new Error('No se puede cancelar una sesión ya completada');
    }
    this._status = ClassSessionStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  complete(): void {
    if (this._status === ClassSessionStatus.CANCELLED) {
      throw new Error('No se puede completar una sesión cancelada');
    }
    this._status = ClassSessionStatus.COMPLETED;
    this._updatedAt = new Date();
  }

  setCapacityOverride(value: number | null): void {
    if (value !== null && (value <= 0 || value > 1000)) {
      throw new Error('capacityOverride fuera de rango');
    }
    this._capacityOverride = value;
    this._updatedAt = new Date();
  }

  isBookable(now: Date): boolean {
    return (
      this._status === ClassSessionStatus.SCHEDULED &&
      now < this._scheduledAt
    );
  }

  toPlainObject() {
    return {
      id: this._id,
      classId: this._classId,
      scheduledAt: this._scheduledAt,
      capacityOverride: this._capacityOverride,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
