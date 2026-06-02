import { LayoutGrid } from 'lucide-react';
import type { ElementType } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Spaces',
    href: '/[lang]/spaces',
    icon: LayoutGrid,
  },
];
