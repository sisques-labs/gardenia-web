import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

vi.mock('@/core/inventory/presentation/hooks/use-inventory-items/use-inventory-items.hook', () => ({
  useInventoryItems: vi.fn(),
}));

vi.mock('@/core/inventory/presentation/hooks/use-delete-inventory-item/use-delete-inventory-item.hook', () => ({
  useDeleteInventoryItem: vi.fn(),
}));

vi.mock('@/core/inventory/presentation/components/inventory-item-modal/inventory-item-modal', () => ({
  InventoryItemModal: ({ item }: { item?: InventoryItem }) => (
    <div data-testid={item ? 'edit-modal' : 'create-modal'} />
  ),
}));

vi.mock('@/core/inventory/presentation/components/adjust-quantity-modal/adjust-quantity-modal', () => ({
  AdjustQuantityModal: () => <div data-testid="adjust-modal" />,
}));

import { useInventoryItems } from '@/core/inventory/presentation/hooks/use-inventory-items/use-inventory-items.hook';
import { useDeleteInventoryItem } from '@/core/inventory/presentation/hooks/use-delete-inventory-item/use-delete-inventory-item.hook';
import { InventoryListScreen } from './inventory-list.screen';

const dict = enInventory as AppDict['inventory'];

const mockItems: InventoryItem[] = [
  {
    id: 'i1',
    itemType: 'SEEDS',
    name: 'Lettuce seeds',
    brand: null,
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
  },
];

const mockMutate = vi.fn();

describe('InventoryListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteInventoryItem).mockReturnValue({
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useDeleteInventoryItem>);
  });

  it('renders a loading skeleton when loading', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: [], isLoading: true, error: null });
    const { container } = render(<InventoryListScreen dict={dict} lang="en" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders the empty state when there are no items', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: [], isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    expect(screen.getByText('No supplies yet')).toBeInTheDocument();
  });

  it('renders the items in a table when populated', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    expect(screen.getByText('Lettuce seeds')).toBeInTheDocument();
  });

  it('opens the create modal when the new item button is clicked', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: [], isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'New item' }));
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('deletes an item when the row delete action is clicked', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(mockMutate).toHaveBeenCalledWith('i1');
  });

  it('opens the edit modal when the row edit action is clicked', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('opens the adjust modal when the row adjust action is clicked', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: /adjust/i }));
    expect(screen.getByTestId('adjust-modal')).toBeInTheDocument();
  });
});
