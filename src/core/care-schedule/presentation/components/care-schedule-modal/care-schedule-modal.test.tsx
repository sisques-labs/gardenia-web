import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import en from '@/core/care-schedule/presentation/i18n/en';

vi.mock('@/core/care-schedule/presentation/hooks/use-care-schedule-form/use-care-schedule-form.hook', () => ({
  useCareScheduleForm: vi.fn(),
}));

vi.mock('@/core/plants/presentation/hooks/use-plants/use-plants.hook', () => ({
  usePlants: vi.fn(() => ({ data: [{ id: 'plant-1', name: 'Monstera' }, { id: 'plant-2', name: 'Ficus' }] })),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 's1' })),
}));

import { useCareScheduleForm } from '@/core/care-schedule/presentation/hooks/use-care-schedule-form/use-care-schedule-form.hook';
import { CareScheduleModal } from './care-schedule-modal';

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2026-07-05',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
};

function makeMockForm(overrides: Partial<ReturnType<typeof useCareScheduleForm>> = {}) {
  const mockRegister = vi.fn((name: string) => ({ name }));
  return {
    form: {
      register: mockRegister,
      formState: { errors: {} },
    },
    isPending: false,
    onSubmit: vi.fn((e?: React.BaseSyntheticEvent) => { e?.preventDefault?.(); }),
    isRecurring: true,
    activityType: 'WATERING' as const,
    unit: undefined,
    plantId: 'plant-1',
    setActivityType: vi.fn(),
    setUnit: vi.fn(),
    setPlantId: vi.fn(),
    setIsRecurring: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useCareScheduleForm>;
}

describe('CareScheduleModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCareScheduleForm).mockReturnValue(makeMockForm());
  });

  it('renders create title when no careSchedule prop is provided', () => {
    render(<CareScheduleModal dict={en} onClose={vi.fn()} lockedPlantId="plant-1" />);
    expect(screen.getByText(en.form.title)).toBeInTheDocument();
  });

  it('renders edit title when a careSchedule prop is provided', () => {
    render(<CareScheduleModal dict={en} onClose={vi.fn()} careSchedule={mockCareSchedule} />);
    expect(screen.getByText(en.form.editTitle)).toBeInTheDocument();
  });

  it('hides the plant picker when lockedPlantId is given', () => {
    render(<CareScheduleModal dict={en} onClose={vi.fn()} lockedPlantId="plant-1" />);
    expect(screen.queryByText('Monstera')).toBeNull();
    expect(screen.queryByText(en.form.plant)).toBeNull();
  });

  it('hides the plant picker when editing (plant cannot change)', () => {
    render(<CareScheduleModal dict={en} onClose={vi.fn()} careSchedule={mockCareSchedule} />);
    expect(screen.queryByText(en.form.plant)).toBeNull();
  });

  it('shows the due date field when creating', () => {
    render(<CareScheduleModal dict={en} onClose={vi.fn()} lockedPlantId="plant-1" />);
    expect(screen.getByText(en.form.nextDueAt)).toBeInTheDocument();
  });

  it('hides the due date field when editing (the API cannot change it after creation)', () => {
    render(<CareScheduleModal dict={en} onClose={vi.fn()} careSchedule={mockCareSchedule} />);
    expect(screen.queryByText(en.form.nextDueAt)).toBeNull();
  });

  it('shows the plant picker when creating without a lockedPlantId', () => {
    render(<CareScheduleModal dict={en} onClose={vi.fn()} />);
    expect(screen.getByText(en.form.plant)).toBeInTheDocument();
  });

  it('shows the interval field when isRecurring is true', () => {
    render(<CareScheduleModal dict={en} onClose={vi.fn()} lockedPlantId="plant-1" />);
    expect(screen.getByText(en.form.intervalDays)).toBeInTheDocument();
  });

  it('hides the interval field when isRecurring is false', () => {
    vi.mocked(useCareScheduleForm).mockReturnValue(makeMockForm({ isRecurring: false }));
    render(<CareScheduleModal dict={en} onClose={vi.fn()} lockedPlantId="plant-1" />);
    expect(screen.queryByText(en.form.intervalDays)).toBeNull();
  });

  it('calls onSubmit when the form is submitted', async () => {
    const mockOnSubmit = vi.fn(async (e?: React.BaseSyntheticEvent) => { e?.preventDefault?.(); });
    vi.mocked(useCareScheduleForm).mockReturnValue(makeMockForm({ onSubmit: mockOnSubmit }));

    render(<CareScheduleModal dict={en} onClose={vi.fn()} lockedPlantId="plant-1" />);
    fireEvent.click(screen.getByRole('button', { name: en.form.submit }));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalled());
  });

  it('passes careSchedule and lockedPlantId to useCareScheduleForm', () => {
    const onClose = vi.fn();
    render(<CareScheduleModal dict={en} onClose={onClose} careSchedule={mockCareSchedule} />);

    expect(vi.mocked(useCareScheduleForm)).toHaveBeenCalledWith({ careSchedule: mockCareSchedule, lockedPlantId: undefined, onClose });
  });
});
