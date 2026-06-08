import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';
import type { ShellDict } from './en';

const dict = {
  openNavigation: 'Abrir navegación',
  sidebar: {
    expand: 'Expandir barra lateral',
    collapse: 'Contraer barra lateral',
  },
  spaceSwitcher: {
    activeSpaceLabel: 'Huerta activa',
    switchSpace: 'Cambiar espacio',
  },
  userMenu: {
    openMenu: 'Abrir menú',
    profile: 'Perfil',
    settings: 'Ajustes',
    logOut: 'Cerrar sesión',
  },
  nav: {
    home: 'Inicio',
    spaces: 'Espacios',
    map: 'Mapa',
    inventory: 'Inventario',
    calendar: 'Calendario',
    journal: 'Diario',
    harvests: 'Cosechas',
    pests: 'Plagas',
    community: 'Comunidad',
  },
} satisfies WidenStringLiterals<ShellDict>;

export default dict;
