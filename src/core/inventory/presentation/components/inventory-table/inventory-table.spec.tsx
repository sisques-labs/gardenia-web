import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import { InventoryTable } from './inventory-table';

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

function setup(items: InventoryItem[]) {
  const onViewDetail = vi.fn();
  const onEdit = vi.fn();
  const onAdjust = vi.fn();
  const onDelete = vi.fn();
  render(
    <InventoryTable
      items={items}
      dict={dict}
      onViewDetail={onViewDetail}
      onEdit={onEdit}
      onAdjust={onAdjust}
      onDelete={onDelete}
    />,
  );
  return { onViewDetail, onEdit, onAdjust, onDelete };
}

describe('InventoryTable', () => {
  it('renders column headers', () => {
    setup([makeItem()]);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('renders the item name, brand, localized type and quantity + unit', () => {
    setup([makeItem()]);
    expect(screen.getByText('Lettuce seeds')).toBeInTheDocument();
    expect(screen.getByText('Batlle')).toBeInTheDocument();
    expect(screen.getByText('Seeds')).toBeInTheDocument();
    expect(screen.getByText('3 packets')).toBeInTheDocument();
  });

  it('shows a low-stock badge when quantity <= threshold', () => {
    setup([makeItem({ quantity: 1, lowStockThreshold: 2 })]);
    expect(screen.getByText('Low stock')).toBeInTheDocument();
  });

  it('does not render a selection checkbox column', () => {
    setup([makeItem()]);
    expect(screen.queryByLabelText('Select all')).not.toBeInTheDocument();
  });

  it('fires view detail, adjust, edit and delete callbacks from the row actions menu', async () => {
    const user = userEvent.setup();
    const { onViewDetail, onEdit, onAdjust, onDelete } = setup([makeItem()]);

    await user.click(screen.getByLabelText('Open actions menu'));
    await user.click(screen.getByRole('menuitem', { name: /view detail/i }));
    expect(onViewDetail).toHaveBeenCalledWith(makeItem());

    await user.click(screen.getByLabelText('Open actions menu'));
    await user.click(screen.getByRole('menuitem', { name: /adjust/i }));
    expect(onAdjust).toHaveBeenCalledWith(makeItem());

    await user.click(screen.getByLabelText('Open actions menu'));
    await user.click(screen.getByRole('menuitem', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(makeItem());

    await user.click(screen.getByLabelText('Open actions menu'));
    await user.click(screen.getByRole('menuitem', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(makeItem());
  });
});
