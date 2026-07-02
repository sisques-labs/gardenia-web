import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

vi.mock('@/core/inventory/presentation/hooks/use-inventory-item-form/use-inventory-item-form.hook', () => ({
  useInventoryItemForm: vi.fn(),
}));

import { useInventoryItemForm } from '@/core/inventory/presentation/hooks/use-inventory-item-form/use-inventory-item-form.hook';
import { InventoryItemModal } from './inventory-item-modal';

const dict = enInventory as AppDict['inventory'];

const mockItem: InventoryItem = {
  id: 'item-1',
  itemType: 'FERTILIZER',
  name: 'Tomato fertilizer',
  brand: null,
  notes: null,
  quantity: 500,
  unit: 'G',
  lowStockThreshold: null,
  acquiredAt: null,
  expiresAt: null,
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function makeMockForm(overrides: Partial<ReturnType<typeof useInventoryItemForm>> = {}) {
  return {
    form: {
      register: vi.fn((name: string) => ({ name })),
      formState: { errors: {} },
    },
    isEditing: false,
    isPending: false,
    onSubmit: vi.fn((e?: React.BaseSyntheticEvent) => { e?.preventDefault?.(); }),
    selectedType: 'SEEDS' as const,
    setType: vi.fn(),
    selectedUnit: 'UNITS' as const,
    setUnit: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useInventoryItemForm>;
}

describe('InventoryItemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useInventoryItemForm).mockReturnValue(makeMockForm());
  });

  it('renders the create title and the quantity field when not editing', () => {
    render(<InventoryItemModal dict={dict} onClose={vi.fn()} />);
    expect(screen.getByText('New item')).toBeInTheDocument();
    expect(screen.getByText(dict.form.quantity)).toBeInTheDocument();
  });

  it('renders the edit title and hides the quantity field when editing', () => {
    vi.mocked(useInventoryItemForm).mockReturnValue(makeMockForm({ isEditing: true }));
    render(<InventoryItemModal dict={dict} onClose={vi.fn()} item={mockItem} />);
    expect(screen.getByText('Edit item')).toBeInTheDocument();
    expect(screen.queryByText(dict.form.quantity)).not.toBeInTheDocument();
  });

  it('passes item and onClose to the form hook', () => {
    const onClose = vi.fn();
    render(<InventoryItemModal dict={dict} onClose={onClose} item={mockItem} />);
    expect(vi.mocked(useInventoryItemForm)).toHaveBeenCalledWith({ item: mockItem, onClose });
  });

  it('submits the form when Save is clicked', async () => {
    const onSubmit = vi.fn(async (e?: React.BaseSyntheticEvent) => { e?.preventDefault?.(); });
    vi.mocked(useInventoryItemForm).mockReturnValue(makeMockForm({ onSubmit }));
    render(<InventoryItemModal dict={dict} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<InventoryItemModal dict={dict} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
