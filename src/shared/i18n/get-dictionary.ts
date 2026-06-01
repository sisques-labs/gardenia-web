import type { Locale } from './locale';
import type { WidenStringLiterals } from './widen-literals';
import type { AuthDict } from '@/core/auth/i18n/en';

import enAuth from '@/core/auth/i18n/en';
import esAuth from '@/core/auth/i18n/es';

// Add module imports here as new contexts are created:
// import enSpaces from '@/core/spaces/i18n/en';
// import esSpaces from '@/core/spaces/i18n/es';

export type AppDict = {
  auth: WidenStringLiterals<AuthDict>;
  // spaces: WidenStringLiterals<SpacesDict>;
};

const dictionaries: Record<Locale, AppDict> = {
  en: {
    auth: enAuth,
  },
  es: {
    auth: esAuth,
  },
};

export function getDictionary(locale: Locale): AppDict {
  return dictionaries[locale];
}
