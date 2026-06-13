import type { HarvestsDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type HarvestsDictTranslated = WidenStringLiterals<HarvestsDict>;

const dict = {
  list: {
    title: 'Cosechas',
    empty: 'Todavía no hay cosechas',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esta cosecha?',
    newHarvest: 'Nueva cosecha',
  },
  form: {
    title: 'Nueva cosecha',
    editTitle: 'Editar cosecha',
    submitting: 'Guardando...',
    cropType: 'Tipo de cultivo',
    quantity: 'Cantidad',
    unit: 'Unidad',
    harvestedAt: 'Cosechado el',
    submit: 'Guardar',
    cancel: 'Cancelar',
  },
  row: {
    edit: 'Editar',
    delete: 'Eliminar',
  },
  units: {
    KG: 'kg',
    G: 'g',
    PIECES: 'unidades',
    LITERS: 'l',
    ML: 'ml',
    BUNCHES: 'manojos',
  },
  errors: {
    loadFailed: 'No se pudieron cargar las cosechas. Inténtalo de nuevo.',
    createFailed: 'No se pudo crear la cosecha. Inténtalo de nuevo.',
    updateFailed: 'No se pudo actualizar la cosecha. Inténtalo de nuevo.',
    deleteFailed: 'No se pudo eliminar la cosecha. Inténtalo de nuevo.',
  },
} as const satisfies HarvestsDictTranslated;

export default dict;
