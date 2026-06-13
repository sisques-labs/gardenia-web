import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';
import { HarvestRow } from './harvest-row';

const mockHarvest: Harvest = {
  id: 'h1',
  cropType: 'Tomato',
  quantity: 2.5,
  unit: 'KG',
  harvestedAt: '2026-06-01',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2026-06-01',
  updatedAt: '2026-06-01',
};

const dict = {
  list: {
    title: 'Harvests',
    empty: 'No harvests yet',
    deleteConfirm: 'Are you sure?',
    newHarvest: 'New harvest',
  },
  form: {
    cropType: 'Crop type',
    quantity: 'Quantity',
    unit: 'Unit',
    harvestedAt: 'Harvested on',
    submit: 'Save',
    cancel: 'Cancel',
  },
  units: {
    KG: 'kg',
    G: 'g',
    PIECES: 'pieces',
    LITERS: 'l',
    ML: 'ml',
    BUNCHES: 'bunches',
  },
  errors: {
    loadFailed: 'Could not load harvests.',
    createFailed: 'Could not create.',
    updateFailed: 'Could not update.',
    deleteFailed: 'Could not delete.',
  },
};

describe('HarvestRow', () => {
  it('renders cropType', () => {
    render(<HarvestRow harvest={mockHarvest} onDelete={vi.fn()} dict={dict} />);
    expect(screen.getByText('Tomato')).toBeInTheDocument();
  });

  it('renders quantity', () => {
    render(<HarvestRow harvest={mockHarvest} onDelete={vi.fn()} dict={dict} />);
    expect(screen.getByText(/2\.5/)).toBeInTheDocument();
  });

  it('renders unit label from dict.units', () => {
    render(<HarvestRow harvest={mockHarvest} onDelete={vi.fn()} dict={dict} />);
    expect(screen.getByText(/kg/)).toBeInTheDocument();
  });

  it('renders harvestedAt', () => {
    render(<HarvestRow harvest={mockHarvest} onDelete={vi.fn()} dict={dict} />);
    expect(screen.getByText(/2026-06-01/)).toBeInTheDocument();
  });

  it('calls onDelete with harvest.id when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<HarvestRow harvest={mockHarvest} onDelete={onDelete} dict={dict} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith('h1');
  });
});
