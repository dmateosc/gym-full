import { BookingEntity } from './booking.entity';
import { BookingStatus } from '../value-objects/booking-status.vo';

const base = () => ({
  id: 'b1',
  sessionId: 's1',
  userId: 'u1',
});

describe('BookingEntity', () => {
  it('defaults to confirmed when no status given', () => {
    const b = new BookingEntity(base());
    expect(b.isConfirmed()).toBe(true);
    expect(b.isActive()).toBe(true);
  });

  it('waitlist booking keeps its position', () => {
    const b = new BookingEntity({
      ...base(),
      status: BookingStatus.WAITLIST,
      position: 3,
    });
    expect(b.isWaitlist()).toBe(true);
    expect(b.position).toBe(3);
  });

  it('promoteToConfirmed clears position and bumps updatedAt', () => {
    const b = new BookingEntity({
      ...base(),
      status: BookingStatus.WAITLIST,
      position: 2,
      updatedAt: new Date(0),
    });
    const before = b.updatedAt;
    b.promoteToConfirmed();
    expect(b.isConfirmed()).toBe(true);
    expect(b.position).toBeNull();
    expect(b.updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });

  it('promoteToConfirmed throws when not in waitlist', () => {
    const b = new BookingEntity(base());
    expect(() => b.promoteToConfirmed()).toThrow(/lista de espera/);
  });

  it('cancel is idempotent and clears position', () => {
    const b = new BookingEntity({
      ...base(),
      status: BookingStatus.WAITLIST,
      position: 4,
    });
    b.cancel();
    expect(b.isCancelled()).toBe(true);
    expect(b.position).toBeNull();
    const ts = b.updatedAt;
    b.cancel();
    expect(b.updatedAt).toBe(ts);
  });

  it('belongsTo checks ownership', () => {
    const b = new BookingEntity(base());
    expect(b.belongsTo('u1')).toBe(true);
    expect(b.belongsTo('someone-else')).toBe(false);
  });
});
