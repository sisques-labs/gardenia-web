import { Home, LayoutGrid, Leaf, Map, Calendar, BookOpen, Wheat, Bug, Users, User } from 'lucide-react';
import type { ElementType } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: ElementType;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/[lang]/home', icon: Home },
  { label: 'Spaces', href: '/[lang]/spaces', icon: LayoutGrid },
  { label: 'Map', href: '/[lang]/map', icon: Map, disabled: true },
  { label: 'Inventory', href: '/[lang]/plants', icon: Leaf },
  { label: 'Calendar', href: '/[lang]/calendar', icon: Calendar, disabled: true },
  { label: 'Journal', href: '/[lang]/journal', icon: BookOpen, disabled: true },
  { label: 'Harvests', href: '/[lang]/harvests', icon: Wheat, disabled: true },
  { label: 'Pests', href: '/[lang]/pests', icon: Bug, disabled: true },
  { label: 'Community', href: '/[lang]/community', icon: Users, disabled: true },
  { label: 'Profile', href: '/[lang]/profile', icon: User },
];
