import type { Season } from '../interfaces/season.interface';

type SeasonDictKey = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASON_KEYS: Record<Season, SeasonDictKey> = {
  primavera: 'spring',
  verano: 'summer',
  otoño: 'autumn',
  invierno: 'winter',
};
