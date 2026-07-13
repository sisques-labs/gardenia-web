import type { Locale } from './locale';
import type { WidenStringLiterals } from './widen-literals';
import type { AuthDict } from '@/core/auth/presentation/i18n/en';
import type { SpacesDict } from '@/core/spaces/presentation/i18n/en';
import type { HomeDict } from '@/core/home/presentation/i18n/en';
import type { PlantsDict } from '@/core/plants/presentation/i18n/en';
import type { UsersDict } from '@/core/users/presentation/i18n/en';
import type { CalendarDict } from '@/core/calendar/presentation/i18n/en';
import type { ShellDict } from '@/shared/presentation/i18n/shell/en';
import type { HarvestsDict } from '@/core/harvests/presentation/i18n/en';
import type { CareLogDict } from '@/core/care-log/presentation/i18n/en';
import type { PlantingSpotsDict } from '@/core/planting-spots/presentation/i18n/en';
import type { InventoryDict } from '@/core/inventory/presentation/i18n/en';
import type { CareScheduleDict } from '@/core/care-schedule/presentation/i18n/en';
import type { PlantPhotosDict } from '@/core/plant-photos/presentation/i18n/en';
import type { NotificationsDict } from '@/core/notifications/presentation/i18n/en';

import enAuth from '@/core/auth/presentation/i18n/en';
import esAuth from '@/core/auth/presentation/i18n/es';
import enSpaces from '@/core/spaces/presentation/i18n/en';
import esSpaces from '@/core/spaces/presentation/i18n/es';
import enHome from '@/core/home/presentation/i18n/en';
import esHome from '@/core/home/presentation/i18n/es';
import enPlants from '@/core/plants/presentation/i18n/en';
import esPlants from '@/core/plants/presentation/i18n/es';
import enUsers from '@/core/users/presentation/i18n/en';
import esUsers from '@/core/users/presentation/i18n/es';
import enCalendar from '@/core/calendar/presentation/i18n/en';
import esCalendar from '@/core/calendar/presentation/i18n/es';
import enShell from '@/shared/presentation/i18n/shell/en';
import esShell from '@/shared/presentation/i18n/shell/es';
import enHarvests from '@/core/harvests/presentation/i18n/en';
import esHarvests from '@/core/harvests/presentation/i18n/es';
import enCareLog from '@/core/care-log/presentation/i18n/en';
import esCareLog from '@/core/care-log/presentation/i18n/es';
import enPlantingSpots from '@/core/planting-spots/presentation/i18n/en';
import esPlantingSpots from '@/core/planting-spots/presentation/i18n/es';
import enInventory from '@/core/inventory/presentation/i18n/en';
import esInventory from '@/core/inventory/presentation/i18n/es';
import enCareSchedule from '@/core/care-schedule/presentation/i18n/en';
import esCareSchedule from '@/core/care-schedule/presentation/i18n/es';
import enPlantPhotos from '@/core/plant-photos/presentation/i18n/en';
import esPlantPhotos from '@/core/plant-photos/presentation/i18n/es';
import enNotifications from '@/core/notifications/presentation/i18n/en';
import esNotifications from '@/core/notifications/presentation/i18n/es';

export type AppDict = {
  auth: WidenStringLiterals<AuthDict>;
  spaces: WidenStringLiterals<SpacesDict>;
  home: WidenStringLiterals<HomeDict>;
  plants: WidenStringLiterals<PlantsDict>;
  users: WidenStringLiterals<UsersDict>;
  calendar: WidenStringLiterals<CalendarDict>;
  shell: WidenStringLiterals<ShellDict>;
  harvests: WidenStringLiterals<HarvestsDict>;
  careLog: WidenStringLiterals<CareLogDict>;
  plantingSpots: WidenStringLiterals<PlantingSpotsDict>;
  inventory: WidenStringLiterals<InventoryDict>;
  careSchedule: WidenStringLiterals<CareScheduleDict>;
  plantPhotos: WidenStringLiterals<PlantPhotosDict>;
  notifications: WidenStringLiterals<NotificationsDict>;
};

const dictionaries: Record<Locale, AppDict> = {
  en: {
    auth: enAuth,
    spaces: enSpaces,
    home: enHome,
    plants: enPlants,
    users: enUsers,
    calendar: enCalendar,
    shell: enShell,
    harvests: enHarvests,
    careLog: enCareLog,
    plantingSpots: enPlantingSpots,
    inventory: enInventory,
    careSchedule: enCareSchedule,
    plantPhotos: enPlantPhotos,
    notifications: enNotifications,
  },
  es: {
    auth: esAuth,
    spaces: esSpaces,
    home: esHome,
    plants: esPlants,
    users: esUsers,
    calendar: esCalendar,
    shell: esShell,
    harvests: esHarvests,
    careLog: esCareLog,
    plantingSpots: esPlantingSpots,
    inventory: esInventory,
    careSchedule: esCareSchedule,
    plantPhotos: esPlantPhotos,
    notifications: esNotifications,
  },
};

export function getDictionary(locale: Locale): AppDict {
  return dictionaries[locale];
}
