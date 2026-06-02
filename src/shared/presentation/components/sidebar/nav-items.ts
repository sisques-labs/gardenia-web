import { LayoutGrid } from 'lucide-react';
import type { ReactNode } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Spaces',
    href: '/[lang]/spaces',
    icon: LayoutGrid,
  },
];
