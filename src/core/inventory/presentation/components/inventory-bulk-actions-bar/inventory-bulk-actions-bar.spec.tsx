import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import { InventoryBulkActionsBar } from './inventory-bulk-actions-bar';

const dict = enInventory as AppDict['inventory'];

describe('InventoryBulkActionsBar', () => {
  it('renders nothing when no rows are selected', () => {
    const { container } = render(
      <InventoryBulkActionsBar dict={dict} selectedCount={0} onDeleteSelected={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the selected count and a "Delete selected" button', () => {
    render(<InventoryBulkActionsBar dict={dict} selectedCount={3} onDeleteSelected={vi.fn()} />);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete selected' })).toBeInTheDocument();
  });

  it('calls onDeleteSelected when the button is clicked', () => {
    const onDeleteSelected = vi.fn();
    render(<InventoryBulkActionsBar dict={dict} selectedCount={2} onDeleteSelected={onDeleteSelected} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));

    expect(onDeleteSelected).toHaveBeenCalledTimes(1);
  });
});
