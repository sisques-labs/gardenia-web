import type { Season } from '@/core/calendar/domain/interfaces/season.interface';

export function getSeason(month: number): Season {
  if (month === 11 || month <= 1) return 'invierno';
  if (month <= 4) return 'primavera';
  if (month <= 7) return 'verano';
  return 'otoño';
}
