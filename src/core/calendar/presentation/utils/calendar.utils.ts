export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOffset(year: number, month: number): number {
  const dayOfWeek = new Date(year, month, 1).getDay();
  return (dayOfWeek + 6) % 7;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type Season = 'primavera' | 'verano' | 'otoño' | 'invierno';

export function getSeason(month: number): Season {
  if (month === 11 || month <= 1) return 'invierno';
  if (month <= 4) return 'primavera';
  if (month <= 7) return 'verano';
  return 'otoño';
}
