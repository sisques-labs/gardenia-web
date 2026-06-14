import type { CareLogDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const dict = {
  sectionTitle: 'Últimos cuidados',
  empty: 'Todavía no hay actividades registradas.',
  activityTypes: {
    [CareLogActivityType.WATERING]: 'Riego',
    [CareLogActivityType.FERTILIZING]: 'Fertilización',
    [CareLogActivityType.PRUNING]: 'Poda',
    [CareLogActivityType.REPOTTING]: 'Trasplante de maceta',
    [CareLogActivityType.TRANSPLANTING]: 'Trasplante',
    [CareLogActivityType.PEST_TREATMENT]: 'Tratamiento de plagas',
    [CareLogActivityType.MISTING]: 'Pulverización',
    [CareLogActivityType.ROTATION]: 'Rotación',
    [CareLogActivityType.OTHER]: 'Otro',
  },
} as const satisfies WidenStringLiterals<CareLogDict>;

export default dict;
