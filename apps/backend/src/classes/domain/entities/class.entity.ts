import {
  ClassCategory,
  isClassCategory,
} from '../value-objects/class-category.vo';

/**
 * Patrón semanal recurrente de una clase colectiva. Las ocurrencias
 * concretas viven en ClassSessionEntity. Soft-delete via `active`.
 */
export class ClassEntity {
  private readonly _id: string;
  private _instructorId: string;
  private _name: string;
  private _description: string | null;
  private _category: ClassCategory;
  private _dayOfWeek: number; // 0=domingo … 6=sábado (Postgres DOW)
  private _startTime: string; // 'HH:MM'
  private _durationMin: number;
  private _capacity: number;
  private _location: string | null;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    instructorId: string;
    name: string;
    description?: string | null;
    category: ClassCategory | string;
    dayOfWeek: number;
    startTime: string;
    durationMin: number;
    capacity: number;
    location?: string | null;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('El nombre de la clase es obligatorio');
    }
    if (!isClassCategory(props.category)) {
      throw new Error(`Categoría inválida: ${String(props.category)}`);
    }
    if (props.dayOfWeek < 0 || props.dayOfWeek > 6) {
      throw new Error('dayOfWeek debe estar entre 0 (domingo) y 6 (sábado)');
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(props.startTime)) {
      throw new Error(`startTime inválido: ${props.startTime} (formato HH:MM)`);
    }
    if (props.durationMin <= 0 || props.durationMin > 600) {
      throw new Error('durationMin debe estar entre 1 y 600 minutos');
    }
    if (props.capacity <= 0 || props.capacity > 1000) {
      throw new Error('capacity debe estar entre 1 y 1000');
    }

    this._id = props.id;
    this._instructorId = props.instructorId;
    this._name = props.name.trim();
    this._description = props.description?.trim() || null;
    this._category = props.category;
    this._dayOfWeek = props.dayOfWeek;
    this._startTime = props.startTime;
    this._durationMin = props.durationMin;
    this._capacity = props.capacity;
    this._location = props.location?.trim() || null;
    this._active = props.active ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string {
    return this._id;
  }
  get instructorId(): string {
    return this._instructorId;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get category(): ClassCategory {
    return this._category;
  }
  get dayOfWeek(): number {
    return this._dayOfWeek;
  }
  get startTime(): string {
    return this._startTime;
  }
  get durationMin(): number {
    return this._durationMin;
  }
  get capacity(): number {
    return this._capacity;
  }
  get location(): string | null {
    return this._location;
  }
  get active(): boolean {
    return this._active;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('El nombre no puede estar vacío');
    }
    this._name = newName.trim();
    this.touch();
  }

  changeSchedule(
    dayOfWeek: number,
    startTime: string,
    durationMin: number,
  ): void {
    if (dayOfWeek < 0 || dayOfWeek > 6)
      throw new Error('dayOfWeek fuera de rango');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
      throw new Error('startTime inválido');
    }
    if (durationMin <= 0 || durationMin > 600)
      throw new Error('durationMin fuera de rango');
    this._dayOfWeek = dayOfWeek;
    this._startTime = startTime;
    this._durationMin = durationMin;
    this.touch();
  }

  reassignInstructor(instructorId: string): void {
    if (!instructorId) throw new Error('instructorId vacío');
    this._instructorId = instructorId;
    this.touch();
  }

  setCapacity(capacity: number): void {
    if (capacity <= 0 || capacity > 1000) {
      throw new Error('capacity fuera de rango');
    }
    this._capacity = capacity;
    this.touch();
  }

  updateDetails(props: {
    description?: string | null;
    category?: ClassCategory | string;
    location?: string | null;
  }): void {
    if (props.description !== undefined) {
      this._description = props.description?.trim() || null;
    }
    if (props.category !== undefined) {
      if (!isClassCategory(props.category)) {
        throw new Error(`Categoría inválida: ${String(props.category)}`);
      }
      this._category = props.category;
    }
    if (props.location !== undefined) {
      this._location = props.location?.trim() || null;
    }
    this.touch();
  }

  deactivate(): void {
    this._active = false;
    this.touch();
  }

  activate(): void {
    this._active = true;
    this.touch();
  }

  isActive(): boolean {
    return this._active;
  }

  belongsTo(instructorId: string): boolean {
    return this._instructorId === instructorId;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  toPlainObject() {
    return {
      id: this._id,
      instructorId: this._instructorId,
      name: this._name,
      description: this._description,
      category: this._category,
      dayOfWeek: this._dayOfWeek,
      startTime: this._startTime,
      durationMin: this._durationMin,
      capacity: this._capacity,
      location: this._location,
      active: this._active,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
