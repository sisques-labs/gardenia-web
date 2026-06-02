import { Home, LayoutGrid } from 'lucide-react';
import type { ElementType } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home', // TODO: i18n
    href: '/[lang]/home',
    icon: Home,
  },
  {
    label: 'Spaces',
    href: '/[lang]/spaces',
    icon: LayoutGrid,
  },
];
