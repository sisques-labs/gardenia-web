import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import { InventoryItemRow } from './inventory-item-row';

const dict = enInventory as AppDict['inventory'];

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'i1',
    itemType: 'SEEDS',
    name: 'Lettuce seeds',
    brand: 'Batlle',
    notes: null,
    quantity: 3,
    unit: 'PACKETS',
    lowStockThreshold: null,
    acquiredAt: null,
    expiresAt: null,
    userId: 'u1',
    spaceId: 's1',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('InventoryItemRow', () => {
  it('renders the name and brand', () => {
    render(
      <InventoryItemRow item={makeItem()} dict={dict} onEdit={vi.fn()} onAdjust={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByText('Lettuce seeds')).toBeInTheDocument();
    expect(screen.getByText(/Batlle/)).toBeInTheDocument();
  });

  it('renders the localized type and quantity + unit', () => {
    render(
      <InventoryItemRow item={makeItem()} dict={dict} onEdit={vi.fn()} onAdjust={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByText('Seeds')).toBeInTheDocument();
    expect(screen.getByText(/3 packets/)).toBeInTheDocument();
  });

  it('shows a low-stock badge when quantity <= threshold', () => {
    render(
      <InventoryItemRow
        item={makeItem({ quantity: 1, lowStockThreshold: 2 })}
        dict={dict}
        onEdit={vi.fn()}
        onAdjust={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Low stock')).toBeInTheDocument();
  });

  it('does not show badges when stock is healthy and no expiry', () => {
    render(
      <InventoryItemRow item={makeItem()} dict={dict} onEdit={vi.fn()} onAdjust={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.queryByText('Low stock')).not.toBeInTheDocument();
    expect(screen.queryByText('Expiring soon')).not.toBeInTheDocument();
  });

  it('fires callbacks for adjust, edit and delete', () => {
    const onEdit = vi.fn();
    const onAdjust = vi.fn();
    const onDelete = vi.fn();
    const item = makeItem();
    render(
      <InventoryItemRow item={item} dict={dict} onEdit={onEdit} onAdjust={onAdjust} onDelete={onDelete} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /adjust/i }));
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(onAdjust).toHaveBeenCalledWith(item);
    expect(onEdit).toHaveBeenCalledWith(item);
    expect(onDelete).toHaveBeenCalledWith('i1');
  });
});
