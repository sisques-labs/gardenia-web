import type { Locale } from './locale';
import type { WidenStringLiterals } from './widen-literals';
import type { AuthDict } from '@/core/auth/presentation/i18n/en';
import type { SpacesDict } from '@/core/spaces/presentation/i18n/en';

import enAuth from '@/core/auth/presentation/i18n/en';
import esAuth from '@/core/auth/presentation/i18n/es';
import enSpaces from '@/core/spaces/presentation/i18n/en';
import esSpaces from '@/core/spaces/presentation/i18n/es';

export type AppDict = {
  auth: WidenStringLiterals<AuthDict>;
  spaces: WidenStringLiterals<SpacesDict>;
};

const dictionaries: Record<Locale, AppDict> = {
  en: {
    auth: enAuth,
    spaces: enSpaces,
  },
  es: {
    auth: esAuth,
    spaces: esSpaces,
  },
};

export function getDictionary(locale: Locale): AppDict {
  return dictionaries[locale];
}
