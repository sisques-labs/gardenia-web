import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-planting-spot-form/use-planting-spot-form.hook',
  () => ({ usePlantingSpotForm: vi.fn() }),
);

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    Controller: ({ name, render }: { name: string; render: (p: { field: { value: string; onChange: () => void; onBlur: () => void; ref: () => void; name: string } }) => React.ReactNode }) =>
      render({ field: { value: 'RAISED_BED', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn(), name } }),
  };
});

import { usePlantingSpotForm } from '@/core/planting-spots/presentation/hooks/use-planting-spot-form/use-planting-spot-form.hook';
import { PlantingSpotFormScreen } from './planting-spot-form.screen';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: 'A nice bed',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const dict = {
  list: {
    title: 'Planting spots',
    empty: 'No planting spots.',
    new: 'New planting spot',
  },
  form: {
    titleCreate: 'New planting spot',
    titleEdit: 'Edit planting spot',
    name: 'Name',
    type: 'Type',
    description: 'Description (optional)',
    save: 'Save',
    saving: 'Saving…',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this planting spot?',
    cancel: 'Cancel',
  },
  types: {
    RAISED_BED: 'Raised bed',
    POT: 'Pot',
    CONTAINER: 'Container',
    FIELD_SECTION: 'Field section',
    OTHER: 'Other',
  },
};

function makeMockForm(name = 'Main Bed') {
  const register = () => ({});
  const handleSubmit = (fn: (v: unknown) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    fn({ name, type: 'RAISED_BED', description: '' });
  };
  const control = {};
  const formState = { errors: {} };
  return { register, handleSubmit, control, formState } as never;
}

function buildHookReturn(overrides: Record<string, unknown> = {}) {
  return {
    form: makeMockForm(),
    spot: mockSpot,
    isLoading: false,
    isEdit: true,
    isPending: false,
    deleteOpen: false,
    setDeleteOpen: vi.fn(),
    onSubmit: vi.fn(),
    handleDelete: vi.fn(),
    navigateToList: vi.fn(),
    deleteMutation: { isPending: false },
    ...overrides,
  };
}

describe('PlantingSpotFormScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create title in create mode', () => {
    vi.mocked(usePlantingSpotForm).mockReturnValue(
      buildHookReturn({ isEdit: false }) as never,
    );
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="create" />);
    expect(screen.getAllByText('New planting spot').length).toBeGreaterThan(0);
  });

  it('renders edit title in edit mode', () => {
    vi.mocked(usePlantingSpotForm).mockReturnValue(buildHookReturn() as never);
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    expect(screen.getAllByText('Edit planting spot').length).toBeGreaterThan(0);
  });

  it('renders delete button only in edit mode', () => {
    vi.mocked(usePlantingSpotForm).mockReturnValue(buildHookReturn() as never);
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('does not render delete button in create mode', () => {
    vi.mocked(usePlantingSpotForm).mockReturnValue(
      buildHookReturn({ isEdit: false }) as never,
    );
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="create" />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows delete confirmation dialog when deleteOpen is true', async () => {
    vi.mocked(usePlantingSpotForm).mockReturnValue(
      buildHookReturn({ deleteOpen: true }) as never,
    );
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this planting spot?')).toBeInTheDocument();
    });
  });

  it('renders skeleton when loading in edit mode', () => {
    vi.mocked(usePlantingSpotForm).mockReturnValue(
      buildHookReturn({ isLoading: true }) as never,
    );
    const { container } = render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
