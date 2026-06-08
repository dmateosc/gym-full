import { ClassSessionEntity } from './class-session.entity';
import { ClassSessionStatus } from '../value-objects/class-session-status.vo';

const base = () => ({
  id: 'session-1',
  classId: 'class-1',
  scheduledAt: new Date('2026-06-15T17:00:00Z'),
});

describe('ClassSessionEntity', () => {
  it('starts as scheduled and bookable in the future', () => {
    const s = new ClassSessionEntity(base());
    expect(s.status).toBe(ClassSessionStatus.SCHEDULED);
    expect(s.isBookable(new Date('2026-06-15T16:59:00Z'))).toBe(true);
  });

  it('is not bookable after start time', () => {
    const s = new ClassSessionEntity(base());
    expect(s.isBookable(new Date('2026-06-15T17:00:00Z'))).toBe(false);
    expect(s.isBookable(new Date('2026-06-15T18:00:00Z'))).toBe(false);
  });

  it('cancel changes status and blocks booking', () => {
    const s = new ClassSessionEntity(base());
    s.cancel();
    expect(s.status).toBe(ClassSessionStatus.CANCELLED);
    expect(s.isBookable(new Date('2026-06-15T16:00:00Z'))).toBe(false);
  });

  it('cannot cancel a completed session', () => {
    const s = new ClassSessionEntity(base());
    s.complete();
    expect(() => s.cancel()).toThrow(/cancelar/);
  });

  it('effectiveCapacity uses override when set', () => {
    const s = new ClassSessionEntity({ ...base(), capacityOverride: 5 });
    expect(s.effectiveCapacity(20)).toBe(5);
  });

  it('effectiveCapacity falls back to class capacity', () => {
    const s = new ClassSessionEntity(base());
    expect(s.effectiveCapacity(20)).toBe(20);
  });
});
