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
    createSpace: 'Nuevo espacio',
  },
  userMenu: {
    openMenu: 'Abrir menú',
    profile: 'Perfil',
    settings: 'Ajustes',
    logOut: 'Cerrar sesión',
  },
  nav: {
    home: 'Inicio',
    map: 'Mapa',
    plants: 'Plantas',
    calendar: 'Calendario',
    journal: 'Diario',
    harvests: 'Cosechas',
    inventory: 'Inventario',
    pests: 'Plagas',
    community: 'Comunidad',
    plantingSpots: 'Zonas de cultivo',
  },
} satisfies WidenStringLiterals<ShellDict>;

export default dict;
