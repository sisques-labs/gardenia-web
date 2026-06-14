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
  settings: {
    title: 'Ajustes del espacio',
    details: {
      title: 'Detalles del espacio',
      name: 'Nombre',
      owner: 'Propietario',
      createdAt: 'Creado el',
    },
    invitation: {
      title: 'Crear invitación',
      roleLabel: 'Rol',
      roleMember: 'Miembro',
      roleOwner: 'Propietario',
      expiresLabel: 'Caduca el (opcional)',
      submit: 'Generar invitación',
      submitting: 'Generando...',
      code: 'Código',
      copyCode: 'Copiar código',
      copyLink: 'Copiar enlace',
      codeCopied: '¡Código copiado!',
      linkCopied: '¡Enlace copiado!',
      qrHint: 'Comparte este QR o el código de arriba para invitar a alguien',
    },
    members: {
      title: 'Miembros',
      pendingApi: 'La lista de miembros estará disponible en una próxima actualización.',
      addTitle: 'Añadir miembro',
      addUserId: 'ID de usuario',
      addUserIdPlaceholder: 'Pega el UUID aquí',
      addSubmit: 'Añadir',
      addSubmitting: 'Añadiendo...',
      addSuccess: 'Miembro añadido correctamente',
      removeTitle: 'Eliminar miembro',
      removeUserId: 'ID de usuario',
      removeUserIdPlaceholder: 'Pega el UUID aquí',
      removeSubmit: 'Eliminar',
      removeSubmitting: 'Eliminando...',
      removeSuccess: 'Miembro eliminado correctamente',
      confirmRemove: '¿Seguro que quieres eliminar a este miembro?',
    },
    errors: {
      loadFailed: 'No se pudieron cargar los detalles del espacio. Inténtalo de nuevo.',
      invitationFailed: 'No se pudo crear la invitación. Inténtalo de nuevo.',
      addFailed: 'No se pudo añadir al miembro. Inténtalo de nuevo.',
      removeFailed: 'No se pudo eliminar al miembro. Inténtalo de nuevo.',
    },
  },
} as const satisfies SpacesDictTranslated;

export default dict;
