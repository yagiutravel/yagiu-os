export function parseIsoDate(isoDate: string): Date {
  return new Date(isoDate.includes("T") ? isoDate : `${isoDate}T00:00:00`);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(from: Date, to: Date): number {
  const diff = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.ceil(diff / 86400000);
}

export function daysUntil(isoDate: string, now = new Date()): number {
  return Math.max(0, daysBetween(now, parseIsoDate(isoDate)));
}

export function daysSince(isoDate: string, now = new Date()): number {
  return Math.max(0, daysBetween(parseIsoDate(isoDate), now));
}

export function isWithinDays(
  isoDate: string,
  days: number,
  now = new Date(),
): boolean {
  const until = daysUntil(isoDate, now);
  return until >= 0 && until <= days;
}

export function isDateInFuture(isoDate: string, now = new Date()): boolean {
  return parseIsoDate(isoDate) >= startOfDay(now);
}

export function isDateInPast(isoDate: string, now = new Date()): boolean {
  return parseIsoDate(isoDate) < startOfDay(now);
}

export function isWithinLastDays(
  isoDate: string,
  days: number,
  now = new Date(),
): boolean {
  return daysSince(isoDate, now) <= days;
}
