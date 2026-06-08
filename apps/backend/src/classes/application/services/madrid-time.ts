/**
 * Time helpers anchored to the gym's local zone (Europe/Madrid).
 *
 * `class.start_time` is a wall-clock "HH:MM" and `class.day_of_week`
 * refers to the Madrid calendar day, so we have to translate between
 * Madrid local time and UTC consistently. Using Intl avoids pulling in
 * date-fns-tz for a tiny surface area.
 */
const TZ = 'Europe/Madrid';

interface MadridParts {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number; // 0=Sunday … 6=Saturday (matches Postgres DOW)
}

function getMadridParts(at: Date): MadridParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = fmt.formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekday = get('weekday');
  const dowMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    dayOfWeek: dowMap[weekday] ?? 0,
  };
}

/** Returns the Postgres-style DOW (0..6) for "now" in Madrid time. */
export function todayDayOfWeekInMadrid(now: Date = new Date()): number {
  return getMadridParts(now).dayOfWeek;
}

/**
 * Builds an absolute UTC Date for `today @ HH:MM` in Madrid time.
 *
 * Approach: compute Madrid's UTC offset for the candidate moment, then
 * construct an ISO string with that offset. Handles DST correctly
 * because `Intl.DateTimeFormat` with timeZoneName: 'shortOffset' gives
 * us the offset that applies on that date.
 */
export function madridLocalToUtc(
  hhmm: string,
  now: Date = new Date(),
): Date {
  const { year, month, day } = getMadridParts(now);
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);

  // Build a tentative UTC date to derive the Madrid offset that applies
  // on this calendar day (Madrid is UTC+1 in winter, UTC+2 in summer).
  const tentative = new Date(Date.UTC(year, month - 1, day, h, m, 0, 0));
  const offsetFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    timeZoneName: 'shortOffset',
  });
  const offsetPart = offsetFmt
    .formatToParts(tentative)
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+0';
  // 'GMT+2', 'GMT+1', etc.
  const match = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(offsetPart);
  const sign = match?.[1] === '-' ? -1 : 1;
  const offH = Number(match?.[2] ?? '0');
  const offM = Number(match?.[3] ?? '0');
  const offsetMinutes = sign * (offH * 60 + offM);

  // Madrid local "year-month-day HH:MM" → UTC: subtract the offset.
  return new Date(tentative.getTime() - offsetMinutes * 60_000);
}

/** Returns [startOfDayUtc, startOfNextDayUtc) for today in Madrid. */
export function madridDayRangeUtc(now: Date = new Date()): {
  fromUtc: Date;
  toUtc: Date;
} {
  const fromUtc = madridLocalToUtc('00:00', now);
  const toUtc = new Date(fromUtc.getTime() + 24 * 3600_000);
  return { fromUtc, toUtc };
}
