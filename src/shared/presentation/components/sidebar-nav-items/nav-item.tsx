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

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={collapsed ? item.label : undefined}
      className={[
        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
        'hover:bg-[var(--forest-bg)] hover:text-[var(--forest)]',
        active
          ? 'bg-[var(--forest-bg)] text-[var(--forest)]'
          : 'text-[var(--ink)]',
      ].join(' ')}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span
        className={[
          'text-sm font-medium transition-all duration-200',
          collapsed ? 'overflow-hidden whitespace-nowrap w-0 opacity-0' : 'w-auto opacity-100',
        ].join(' ')}
      >
        {item.label}
      </span>
    </Link>
  );
}
