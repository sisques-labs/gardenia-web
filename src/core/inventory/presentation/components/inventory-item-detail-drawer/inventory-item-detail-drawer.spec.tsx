import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import { InventoryItemDetailDrawer } from './inventory-item-detail-drawer';

const dict = enInventory as AppDict['inventory'];

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'i1',
    itemType: 'SEEDS',
    name: 'Lettuce seeds',
    brand: 'Batlle',
    notes: 'Stored in the shed',
    quantity: 3,
    unit: 'PACKETS',
    lowStockThreshold: 1,
    acquiredAt: '2026-03-01',
    expiresAt: '2027-03-01',
    userId: 'u1',
    spaceId: 's1',
    createdAt: '2026-01-01',
    updatedAt: '2026-02-01',
    ...overrides,
  };
}

describe('InventoryItemDetailDrawer', () => {
  it('renders nothing when there is no item', () => {
    render(<InventoryItemDetailDrawer dict={dict} lang="en" item={null} onClose={vi.fn()} />);
    expect(screen.queryByText('Lettuce seeds')).not.toBeInTheDocument();
  });

  it('renders the item name as the drawer title and all populated fields', () => {
    render(<InventoryItemDetailDrawer dict={dict} lang="en" item={makeItem()} onClose={vi.fn()} />);

    expect(screen.getByText('Lettuce seeds')).toBeInTheDocument();
    expect(screen.getByText('Batlle')).toBeInTheDocument();
    expect(screen.getByText('Stored in the shed')).toBeInTheDocument();
    expect(screen.getByText('3 packets')).toBeInTheDocument();
  });

  it('shows a placeholder for absent optional fields instead of crashing', () => {
    render(
      <InventoryItemDetailDrawer
        dict={dict}
        lang="en"
        item={makeItem({ brand: null, notes: null, acquiredAt: null, expiresAt: null })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('calls onClose when the drawer close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<InventoryItemDetailDrawer dict={dict} lang="en" item={makeItem()} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
