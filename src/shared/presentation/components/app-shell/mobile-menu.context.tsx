'use client';

import { createContext, useContext } from 'react';

interface MobileMenuContextValue {
  label: string;
  onOpen: () => void;
}

export const MobileMenuContext = createContext<MobileMenuContextValue | null>(null);

export function useMobileMenu() {
  return useContext(MobileMenuContext);
}
