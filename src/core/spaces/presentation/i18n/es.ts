import type { SpacesDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type SpacesDictTranslated = WidenStringLiterals<SpacesDict>;

const dict = {
  list: {
    title: 'Mis espacios',
    empty: 'Todavía no tienes ningún espacio.',
    create: 'Nuevo espacio',
    switchTo: 'Cambiar a este espacio',
    active: 'Activo',
  },
  create: {
    title: 'Crear espacio',
    name: 'Nombre del espacio',
    namePlaceholder: 'Ej. Mi proyecto',
    submit: 'Crear',
    submitting: 'Creando...',
    error: 'No se pudo crear el espacio. Inténtalo de nuevo.',
    nameMin: 'Al menos 3 caracteres',
    nameMax: 'Como máximo 50 caracteres',
  },
  shell: {
    loading: 'Cargando...',
    noSpace: 'Sin espacio activo',
  },
  invite: {
    accepting: 'Uniéndote al espacio...',
    missingCode: 'Este enlace de invitación no es válido o no incluye un código.',
    error: 'No se pudo aceptar la invitación. Puede haber caducado o ya ser miembro.',
  },
} as const satisfies SpacesDictTranslated;

export default dict;
