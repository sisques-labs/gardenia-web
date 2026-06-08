'use client';

import Link from 'next/link';
import type { NavItemConfig } from './nav-items';

interface NavItemProps {
  item: NavItemConfig & { href: string };
  label: string;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}

export function NavItem({ item, label, collapsed, active, onClick }: NavItemProps) {
  const Icon = item.icon;

  const labelNode = (
    <span
      className={[
        'text-sm font-medium transition-all duration-200',
        collapsed ? 'overflow-hidden whitespace-nowrap w-0 opacity-0' : 'w-auto opacity-100',
      ].join(' ')}
    >
      {label}
    </span>
  );

  const baseClass = [
    'flex items-center gap-3 py-2 rounded-md transition-colors',
    collapsed ? 'justify-center px-2' : 'px-3',
    active
      ? 'bg-[var(--forest-bg)] text-[var(--forest)]'
      : 'text-[var(--ink)]',
  ].join(' ');

  if (item.disabled) {
    return (
      <div
        aria-disabled="true"
        title={label}
        className={[baseClass, 'opacity-40 cursor-not-allowed pointer-events-none'].join(' ')}
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" />}
        {labelNode}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={collapsed ? label : undefined}
      className={[baseClass, 'hover:bg-[var(--forest-bg)] hover:text-[var(--forest)]'].join(' ')}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {labelNode}
    </Link>
  );
}
