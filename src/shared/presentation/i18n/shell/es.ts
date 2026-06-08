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
} satisfies WidenStringLiterals<ShellDict>;

export default dict;
