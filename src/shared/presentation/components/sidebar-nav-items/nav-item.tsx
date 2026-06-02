'use client';

import Link from 'next/link';
import type { NavItem as NavItemType } from './nav-items';

interface NavItemProps {
  item: NavItemType;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}

export function NavItem({ item, collapsed, active, onClick }: NavItemProps) {
  const Icon = item.icon;

  const label = (
    <span
      className={[
        'text-sm font-medium transition-all duration-200',
        collapsed ? 'overflow-hidden whitespace-nowrap w-0 opacity-0' : 'w-auto opacity-100',
      ].join(' ')}
    >
      {item.label}
    </span>
  );

  const baseClass = [
    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
    active
      ? 'bg-[var(--forest-bg)] text-[var(--forest)]'
      : 'text-[var(--ink)]',
  ].join(' ');

  if (item.disabled) {
    return (
      <div
        aria-disabled="true"
        title={item.label}
        className={[baseClass, 'opacity-40 cursor-not-allowed pointer-events-none'].join(' ')}
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" />}
        {label}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={collapsed ? item.label : undefined}
      className={[baseClass, 'hover:bg-[var(--forest-bg)] hover:text-[var(--forest)]'].join(' ')}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {label}
    </Link>
  );
}
