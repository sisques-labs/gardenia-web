import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';
import type { SpacesDict } from './en';

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
    missingCode:
      'Este enlace de invitación no es válido o no incluye un código.',
    error:
      'No se pudo aceptar la invitación. Puede haber caducado o ya ser miembro.',
  },
  members: {
    list: {
      loading: 'Cargando miembros...',
      empty: 'Sin miembros aún.',
    },
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
      qrAlt: 'Código QR de invitación al espacio',
      qrHint: 'Comparte este QR o el código de arriba para invitar a alguien',
    },
    members: {
      title: 'Miembros',
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
    geolocation: {
      title: 'Ubicación',
      hint: 'Establece las coordenadas y el tipo de entorno para activar la previsión del tiempo.',
      latitudeLabel: 'Latitud',
      latitudePlaceholder: 'Ej. 40.4168',
      longitudeLabel: 'Longitud',
      longitudePlaceholder: 'Ej. -3.7038',
      environmentLabel: 'Entorno',
      environmentIndoor: 'Interior',
      environmentOutdoor: 'Exterior',
      environmentMixed: 'Mixto',
      environmentNone: 'Ninguno',
      save: 'Guardar ubicación',
      saving: 'Guardando...',
      saveSuccess: 'Ubicación guardada correctamente.',
      saveError: 'No se pudo guardar la ubicación. Inténtalo de nuevo.',
    },
    errors: {
      loadFailed:
        'No se pudieron cargar los detalles del espacio. Inténtalo de nuevo.',
      invitationFailed: 'No se pudo crear la invitación. Inténtalo de nuevo.',
      addFailed: 'No se pudo añadir al miembro. Inténtalo de nuevo.',
      removeFailed: 'No se pudo eliminar al miembro. Inténtalo de nuevo.',
    },
  },
  weather: {
    title: 'Tiempo',
    forecast: 'Previsión de 7 días',
    temperatureUnit: '°C',
    precipitationUnit: 'mm',
    setLocationForWeather: 'Establece una ubicación en los ajustes del espacio para ver la previsión del tiempo.',
    loading: 'Cargando el tiempo...',
    error: 'No se pudieron cargar los datos meteorológicos. Inténtalo de nuevo.',
    noData: 'No hay datos meteorológicos disponibles para esta ubicación.',
  },
} as const satisfies SpacesDictTranslated;

export default dict;
