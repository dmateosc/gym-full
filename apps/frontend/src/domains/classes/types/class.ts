export type ClassCategory =
  | 'cycling'
  | 'yoga'
  | 'pilates'
  | 'hiit'
  | 'strength'
  | 'dance'
  | 'functional'
  | 'crossfit'
  | 'other';

export const CLASS_CATEGORIES: ClassCategory[] = [
  'cycling', 'yoga', 'pilates', 'hiit', 'strength',
  'dance', 'functional', 'crossfit', 'other',
];

export const CLASS_CATEGORY_LABELS: Record<ClassCategory, string> = {
  cycling: 'Ciclismo',
  yoga: 'Yoga',
  pilates: 'Pilates',
  hiit: 'HIIT',
  strength: 'Fuerza',
  dance: 'Baile',
  functional: 'Funcional',
  crossfit: 'CrossFit',
  other: 'Otra',
};

export const DAY_OF_WEEK_LABELS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
];

export type ClassSessionStatus = 'scheduled' | 'cancelled' | 'completed';

export interface Class {
  id: string;
  instructorId: string;
  name: string;
  description: string | null;
  category: ClassCategory;
  dayOfWeek: number;
  startTime: string;
  durationMin: number;
  capacity: number;
  location: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'confirmed' | 'waitlist' | 'cancelled';

export interface TodaySession {
  sessionId: string;
  classId: string;
  instructorId: string;
  name: string;
  description: string | null;
  category: ClassCategory;
  scheduledAt: string;
  durationMin: number;
  capacity: number;
  location: string | null;
  status: ClassSessionStatus;
  bookedCount: number;
  waitlistCount: number;
  availableSpots: number;
  myBookingStatus: BookingStatus | null;
  myWaitlistPosition: number | null;
  myBookingId: string | null;
}

export interface MyBooking {
  bookingId: string;
  status: BookingStatus;
  position: number | null;
  sessionId: string;
  classId: string;
  name: string;
  category: ClassCategory;
  scheduledAt: string;
  durationMin: number;
  location: string | null;
}

export interface Attendee {
  bookingId: string;
  userId: string;
  userEmail: string;
  userFullName: string | null;
  status: BookingStatus;
  position: number | null;
}

export interface Booking {
  id: string;
  sessionId: string;
  userId: string;
  status: BookingStatus;
  position: number | null;
  createdAt: string;
}

export interface CreateClassPayload {
  name: string;
  description?: string | null;
  category: ClassCategory;
  dayOfWeek: number;
  startTime: string;
  durationMin: number;
  capacity: number;
  location?: string | null;
  /** Solo se respeta cuando el caller es admin. */
  instructorId?: string;
}

export type UpdateClassPayload = Partial<CreateClassPayload> & { active?: boolean };
