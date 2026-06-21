import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

export const EXPIRING_SOON_DAYS = 30;

export function isExpiringSoon(
  item: InventoryItem,
  now: Date = new Date(),
  withinDays: number = EXPIRING_SOON_DAYS,
): boolean {
  if (!item.expiresAt) return false;
  const expires = new Date(item.expiresAt).getTime();
  const threshold = now.getTime() + withinDays * 24 * 60 * 60 * 1000;
  return expires <= threshold;
}
