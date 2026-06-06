import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex items-end justify-between px-6 py-5 border-b border-[var(--rule)] flex-none">
      <div className="flex flex-col gap-0.5">
        {eyebrow && (
          <p className="eyebrow text-[var(--ink-3)] uppercase tracking-widest">{eyebrow}</p>
        )}
        <div className="flex items-baseline gap-2">
          <h1 className="headline text-4xl font-medium text-[var(--ink)]">{title}</h1>
          {subtitle && (
            <span
              className="text-xl italic text-[var(--terracotta)]"
              style={{ fontFamily: 'var(--hand)' }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
