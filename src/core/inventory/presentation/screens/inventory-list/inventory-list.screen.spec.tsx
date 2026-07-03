import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

vi.mock('@/core/inventory/presentation/hooks/use-paginated-inventory-items/use-paginated-inventory-items.hook', () => ({
  usePaginatedInventoryItems: vi.fn(),
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

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

import { usePaginatedInventoryItems } from '@/core/inventory/presentation/hooks/use-paginated-inventory-items/use-paginated-inventory-items.hook';
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

function paginated(items: InventoryItem[], overrides: Partial<PaginatedResult<InventoryItem>> = {}) {
  return { items, total: items.length, page: 1, perPage: 20, totalPages: 1, ...overrides };
}

function mockPaginatedItems(items: InventoryItem[], isLoading = false, overrides: Partial<PaginatedResult<InventoryItem>> = {}) {
  vi.mocked(usePaginatedInventoryItems).mockReturnValue({
    data: isLoading ? undefined : paginated(items, overrides),
    isLoading,
  } as unknown as ReturnType<typeof usePaginatedInventoryItems>);
}

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
    mockPaginatedItems([], true);
    const { container } = render(<InventoryListScreen dict={dict} lang="en" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders the empty state when there are no items', () => {
    mockPaginatedItems([]);
    render(<InventoryListScreen dict={dict} lang="en" />);
    expect(screen.getByText('No supplies yet')).toBeInTheDocument();
  });

  it('renders the items in a table when populated', () => {
    mockPaginatedItems(mockItems);
    render(<InventoryListScreen dict={dict} lang="en" />);
    expect(screen.getByText('Lettuce seeds')).toBeInTheDocument();
  });

  it('does not render a pagination footer when there is only one page', () => {
    mockPaginatedItems(mockItems, false, { totalPages: 1 });
    render(<InventoryListScreen dict={dict} lang="en" />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders a pagination footer when there is more than one page', () => {
    mockPaginatedItems(mockItems, false, { total: 40, totalPages: 2, perPage: 20 });
    render(<InventoryListScreen dict={dict} lang="en" />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('opens the create modal when the new item button is clicked', async () => {
    const user = userEvent.setup();
    mockPaginatedItems([]);
    render(<InventoryListScreen dict={dict} lang="en" />);
    await user.click(screen.getByRole('button', { name: 'New item' }));
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('requests delete confirmation (does not delete directly) when the row delete action is clicked', async () => {
    mockPaginatedItems(mockItems);
    render(<InventoryListScreen dict={dict} lang="en" />);
    const user = await openRowActionsMenu();
    await user.click(screen.getByRole('menuitem', { name: /delete/i }));

    expect(mockRequestDelete).toHaveBeenCalledWith(mockItems[0]);
    expect(mockConfirmDelete).not.toHaveBeenCalled();
  });

  it('shows the confirm dialog when an item is pending deletion', () => {
    mockPaginatedItems(mockItems);
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
    mockPaginatedItems(mockItems);
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
    mockPaginatedItems(mockItems);
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
    mockPaginatedItems(mockItems);
    render(<InventoryListScreen dict={dict} lang="en" />);
    const user = await openRowActionsMenu();
    await user.click(screen.getByRole('menuitem', { name: /edit/i }));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('opens the adjust modal when the row adjust action is clicked', async () => {
    mockPaginatedItems(mockItems);
    render(<InventoryListScreen dict={dict} lang="en" />);
    const user = await openRowActionsMenu();
    await user.click(screen.getByRole('menuitem', { name: /adjust/i }));
    expect(screen.getByTestId('adjust-modal')).toBeInTheDocument();
  });
});
