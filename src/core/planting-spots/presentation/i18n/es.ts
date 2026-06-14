import type { PlantingSpotsDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type PlantingSpotsDictTranslated = WidenStringLiterals<PlantingSpotsDict>;

const dict = {
  list: {
    title: 'Zonas de cultivo',
    empty: 'Todavía no hay zonas de cultivo en este espacio.',
    new: 'Nueva zona de cultivo',
  },
  form: {
    titleCreate: 'Nueva zona de cultivo',
    titleEdit: 'Editar zona de cultivo',
    name: 'Nombre',
    type: 'Tipo',
    description: 'Descripción (opcional)',
    save: 'Guardar',
    saving: 'Guardando…',
    delete: 'Eliminar',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esta zona de cultivo?',
    cancel: 'Cancelar',
  },
  types: {
    raised_bed: 'Bancal',
    pot: 'Maceta',
    container: 'Contenedor',
    field_section: 'Sección de campo',
    other: 'Otro',
  },
} as const satisfies PlantingSpotsDictTranslated;

export default dict;
