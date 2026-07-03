import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

vi.mock('@/core/inventory/presentation/hooks/use-inventory-items/use-inventory-items.hook', () => ({
  useInventoryItems: vi.fn(),
}));

const mockRequestDelete = vi.fn();
const mockConfirmDelete = vi.fn();
const mockCancelDelete = vi.fn();

vi.mock('@/core/inventory/presentation/hooks/use-delete-inventory-item-confirm/use-delete-inventory-item-confirm.hook', () => ({
  useDeleteInventoryItemConfirm: vi.fn(() => ({
    itemToDelete: null,
    requestDelete: mockRequestDelete,
    confirmDelete: mockConfirmDelete,
    cancelDelete: mockCancelDelete,
    isError: false,
  })),
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
import { useDeleteInventoryItemConfirm } from '@/core/inventory/presentation/hooks/use-delete-inventory-item-confirm/use-delete-inventory-item-confirm.hook';
import { InventoryListScreen } from './inventory-list.screen';

async function openRowActionsMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('Open actions menu'));
  return user;
}

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

describe('InventoryListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteInventoryItemConfirm).mockReturnValue({
      itemToDelete: null,
      requestDelete: mockRequestDelete,
      confirmDelete: mockConfirmDelete,
      cancelDelete: mockCancelDelete,
      isError: false,
    });
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

  it('opens the create modal when the new item button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useInventoryItems).mockReturnValue({ items: [], isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    await user.click(screen.getByRole('button', { name: 'New item' }));
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('requests delete confirmation (does not delete directly) when the row delete action is clicked', async () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    const user = await openRowActionsMenu();
    await user.click(screen.getByRole('menuitem', { name: /delete/i }));

    expect(mockRequestDelete).toHaveBeenCalledWith(mockItems[0]);
    expect(mockConfirmDelete).not.toHaveBeenCalled();
  });

  it('shows the confirm dialog when an item is pending deletion', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    vi.mocked(useDeleteInventoryItemConfirm).mockReturnValue({
      itemToDelete: mockItems[0],
      requestDelete: mockRequestDelete,
      confirmDelete: mockConfirmDelete,
      cancelDelete: mockCancelDelete,
      isError: false,
    });
    render(<InventoryListScreen dict={dict} lang="en" />);

    expect(screen.getByText(dict.delete.confirmTitle)).toBeInTheDocument();
  });

  it('calls confirmDelete when the confirm dialog is confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    vi.mocked(useDeleteInventoryItemConfirm).mockReturnValue({
      itemToDelete: mockItems[0],
      requestDelete: mockRequestDelete,
      confirmDelete: mockConfirmDelete,
      cancelDelete: mockCancelDelete,
      isError: false,
    });
    render(<InventoryListScreen dict={dict} lang="en" />);

    await user.click(screen.getByRole('button', { name: dict.delete.confirm }));

    expect(mockConfirmDelete).toHaveBeenCalledTimes(1);
  });

  it('shows an error alert when the delete mutation failed', () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    vi.mocked(useDeleteInventoryItemConfirm).mockReturnValue({
      itemToDelete: null,
      requestDelete: mockRequestDelete,
      confirmDelete: mockConfirmDelete,
      cancelDelete: mockCancelDelete,
      isError: true,
    });
    render(<InventoryListScreen dict={dict} lang="en" />);

    expect(screen.getByText(dict.delete.error)).toBeInTheDocument();
  });

  it('opens the edit modal when the row edit action is clicked', async () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    const user = await openRowActionsMenu();
    await user.click(screen.getByRole('menuitem', { name: /edit/i }));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('opens the adjust modal when the row adjust action is clicked', async () => {
    vi.mocked(useInventoryItems).mockReturnValue({ items: mockItems, isLoading: false, error: null });
    render(<InventoryListScreen dict={dict} lang="en" />);
    const user = await openRowActionsMenu();
    await user.click(screen.getByRole('menuitem', { name: /adjust/i }));
    expect(screen.getByTestId('adjust-modal')).toBeInTheDocument();
  });
});
