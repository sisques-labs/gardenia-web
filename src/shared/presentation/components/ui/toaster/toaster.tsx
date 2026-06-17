'use client';

import { Toaster as Sonner } from 'sonner';

const Toaster = () => (
  <Sonner
    position="bottom-right"
    richColors
    theme="system"
    toastOptions={{
      classNames: {
        toast: 'bg-background text-foreground border-border',
      },
    }}
  />
);

export { Toaster };
