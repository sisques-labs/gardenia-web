import { Home, Leaf, Map, Calendar, BookOpen, Wheat, Bug, Users, MapPin } from 'lucide-react';
import type { ElementType } from 'react';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export type NavItemKey = keyof AppDict['shell']['nav'];

export interface NavItemConfig {
  key: NavItemKey;
  href: string;
  icon?: ElementType;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { key: 'home', href: '/[lang]/home', icon: Home },
  { key: 'map', href: '/[lang]/map', icon: Map, disabled: true },
  { key: 'inventory', href: '/[lang]/plants', icon: Leaf },
  { key: 'calendar', href: '/[lang]/calendar', icon: Calendar },
  { key: 'journal', href: '/[lang]/journal', icon: BookOpen, disabled: true },
  { key: 'harvests', href: '/[lang]/harvests', icon: Wheat },
  { key: 'pests', href: '/[lang]/pests', icon: Bug, disabled: true },
  { key: 'community', href: '/[lang]/community', icon: Users, disabled: true },
  { key: 'plantingSpots', href: '/[lang]/planting-spots', icon: MapPin },
];
