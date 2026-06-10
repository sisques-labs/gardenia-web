import type { Locale } from './locale';
import type { WidenStringLiterals } from './widen-literals';
import type { AuthDict } from '@/core/auth/presentation/i18n/en';
import type { SpacesDict } from '@/core/spaces/presentation/i18n/en';
import type { HomeDict } from '@/core/home/presentation/i18n/en';
import type { PlantsDict } from '@/core/plants/presentation/i18n/en';
import type { UsersDict } from '@/core/users/presentation/i18n/en';
import type { CalendarDict } from '@/core/calendar/presentation/i18n/en';
import type { TasksDict } from '@/core/tasks/presentation/i18n/en';
import type { ShellDict } from '@/shared/presentation/i18n/shell/en';

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
import enTasks from '@/core/tasks/presentation/i18n/en';
import esTasks from '@/core/tasks/presentation/i18n/es';
import enShell from '@/shared/presentation/i18n/shell/en';
import esShell from '@/shared/presentation/i18n/shell/es';

export type AppDict = {
  auth: WidenStringLiterals<AuthDict>;
  spaces: WidenStringLiterals<SpacesDict>;
  home: WidenStringLiterals<HomeDict>;
  plants: WidenStringLiterals<PlantsDict>;
  users: WidenStringLiterals<UsersDict>;
  calendar: WidenStringLiterals<CalendarDict>;
  tasks: WidenStringLiterals<TasksDict>;
  shell: WidenStringLiterals<ShellDict>;
};

const dictionaries: Record<Locale, AppDict> = {
  en: {
    auth: enAuth,
    spaces: enSpaces,
    home: enHome,
    plants: enPlants,
    users: enUsers,
    calendar: enCalendar,
    tasks: enTasks,
    shell: enShell,
  },
  es: {
    auth: esAuth,
    spaces: esSpaces,
    home: esHome,
    plants: esPlants,
    users: esUsers,
    calendar: esCalendar,
    tasks: esTasks,
    shell: esShell,
  },
};

export function getDictionary(locale: Locale): AppDict {
  return dictionaries[locale];
}
