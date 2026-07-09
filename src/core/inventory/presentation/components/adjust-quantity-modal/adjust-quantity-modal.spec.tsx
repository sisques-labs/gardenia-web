import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

vi.mock('@/core/inventory/presentation/hooks/use-adjust-quantity-form/use-adjust-quantity-form.hook', () => ({
  useAdjustQuantityForm: vi.fn(),
}));

import { useAdjustQuantityForm } from '@/core/inventory/presentation/hooks/use-adjust-quantity-form/use-adjust-quantity-form.hook';
import { AdjustQuantityModal } from './adjust-quantity-modal';

const dict = enInventory as AppDict['inventory'];

const mockItem: InventoryItem = {
  id: 'item-1',
  itemType: 'SEEDS',
  name: 'Lettuce seeds',
  brand: null,
  notes: null,
  quantity: 5,
  unit: 'PACKETS',
  lowStockThreshold: null,
  acquiredAt: null,
  expiresAt: null,
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function makeMockForm(overrides: Partial<ReturnType<typeof useAdjustQuantityForm>> = {}) {
  return {
    form: {
      register: vi.fn((name: string) => ({ name })),
      formState: { errors: {} },
    },
    isPending: false,
    onSubmit: vi.fn((e?: React.BaseSyntheticEvent) => { e?.preventDefault?.(); }),
    ...overrides,
  } as unknown as ReturnType<typeof useAdjustQuantityForm>;
}

describe('AdjustQuantityModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdjustQuantityForm).mockReturnValue(makeMockForm());
  });

  it('renders the title and the current quantity', () => {
    render(<AdjustQuantityModal dict={dict} item={mockItem} onClose={vi.fn()} />);
    expect(screen.getByText('Adjust quantity')).toBeInTheDocument();
    expect(screen.getByText(/5 packets/)).toBeInTheDocument();
  });

  it('every visible field label is associated with its control', () => {
    render(<AdjustQuantityModal dict={dict} item={mockItem} onClose={vi.fn()} />);
    expect(screen.getByLabelText(dict.adjust.delta)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.adjust.reason)).toBeInTheDocument();
  });

  it('passes item and onClose to the form hook', () => {
    const onClose = vi.fn();
    render(<AdjustQuantityModal dict={dict} item={mockItem} onClose={onClose} />);
    expect(vi.mocked(useAdjustQuantityForm)).toHaveBeenCalledWith({ item: mockItem, onClose });
  });

  it('submits the form when Apply is clicked', async () => {
    const onSubmit = vi.fn(async (e?: React.BaseSyntheticEvent) => { e?.preventDefault?.(); });
    vi.mocked(useAdjustQuantityForm).mockReturnValue(makeMockForm({ onSubmit }));
    render(<AdjustQuantityModal dict={dict} item={mockItem} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<AdjustQuantityModal dict={dict} item={mockItem} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
