import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const dict = {
  sectionTitle: 'Last care',
  empty: 'No care activities logged yet.',
  activityTypes: {
    [CareLogActivityType.WATERING]: 'Watering',
    [CareLogActivityType.FERTILIZING]: 'Fertilizing',
    [CareLogActivityType.PRUNING]: 'Pruning',
    [CareLogActivityType.REPOTTING]: 'Repotting',
    [CareLogActivityType.TRANSPLANTING]: 'Transplanting',
    [CareLogActivityType.PEST_TREATMENT]: 'Pest treatment',
    [CareLogActivityType.MISTING]: 'Misting',
    [CareLogActivityType.ROTATION]: 'Rotation',
    [CareLogActivityType.OTHER]: 'Other',
  },
} as const;

export default dict;
export type CareLogDict = typeof dict;
