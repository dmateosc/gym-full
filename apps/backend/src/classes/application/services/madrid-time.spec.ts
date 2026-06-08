import {
  madridDayRangeUtc,
  madridLocalToUtc,
  todayDayOfWeekInMadrid,
} from './madrid-time';

describe('madrid-time helpers', () => {
  it('todayDayOfWeekInMadrid returns Postgres DOW (Sunday=0..Saturday=6)', () => {
    // 2026-06-15 is a Monday → DOW 1.
    expect(todayDayOfWeekInMadrid(new Date('2026-06-15T10:00:00Z'))).toBe(1);
    // 2026-06-14 is a Sunday → DOW 0.
    expect(todayDayOfWeekInMadrid(new Date('2026-06-14T10:00:00Z'))).toBe(0);
  });

  it('madridLocalToUtc converts a wall-clock to UTC using the Madrid DST-aware offset', () => {
    // Madrid in mid-June is CEST (UTC+2). 19:00 Madrid → 17:00 UTC.
    const utc = madridLocalToUtc('19:00', new Date('2026-06-15T10:00:00Z'));
    expect(utc.toISOString()).toBe('2026-06-15T17:00:00.000Z');
  });

  it('madridLocalToUtc handles winter time (CET, UTC+1)', () => {
    // 2026-01-15 (winter) at 19:00 Madrid → 18:00 UTC.
    const utc = madridLocalToUtc('19:00', new Date('2026-01-15T10:00:00Z'));
    expect(utc.toISOString()).toBe('2026-01-15T18:00:00.000Z');
  });

  it('madridDayRangeUtc spans exactly 24h', () => {
    const { fromUtc, toUtc } = madridDayRangeUtc(new Date('2026-06-15T10:00:00Z'));
    expect(toUtc.getTime() - fromUtc.getTime()).toBe(24 * 3600 * 1000);
  });
});
