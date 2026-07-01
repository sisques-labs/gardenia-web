import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CareScheduleRow } from './care-schedule-row';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import en from '@/core/care-schedule/presentation/i18n/en';

const baseCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2020-01-01',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2020-01-01',
  updatedAt: '2020-01-01',
};

describe('CareScheduleRow', () => {
  it('shows the activity label', () => {
    render(<CareScheduleRow careSchedule={baseCareSchedule} dict={en} onComplete={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Watering')).toBeInTheDocument();
  });

  it('shows an overdue badge when nextDueAt is in the past and active', () => {
    render(<CareScheduleRow careSchedule={baseCareSchedule} dict={en} onComplete={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('does not show an overdue badge when active is false', () => {
    render(
      <CareScheduleRow
        careSchedule={{ ...baseCareSchedule, active: false }}
        dict={en}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByText('Overdue')).toBeNull();
  });

  it('does not show an overdue badge when nextDueAt is earlier today (only the date matters, not the time)', () => {
    const earlierToday = new Date();
    earlierToday.setHours(0, 0, 1, 0);
    render(
      <CareScheduleRow
        careSchedule={{ ...baseCareSchedule, nextDueAt: earlierToday.toISOString() }}
        dict={en}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByText('Overdue')).toBeNull();
  });

  it('shows an overdue badge when nextDueAt was yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    render(
      <CareScheduleRow
        careSchedule={{ ...baseCareSchedule, nextDueAt: yesterday.toISOString() }}
        dict={en}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('does not show an overdue badge when nextDueAt is in the future', () => {
    render(
      <CareScheduleRow
        careSchedule={{ ...baseCareSchedule, nextDueAt: '2999-01-01' }}
        dict={en}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByText('Overdue')).toBeNull();
  });

  it('shows plantName only when passed', () => {
    const { rerender } = render(
      <CareScheduleRow careSchedule={baseCareSchedule} dict={en} onComplete={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.queryByText('Monstera')).toBeNull();

    rerender(
      <CareScheduleRow
        careSchedule={baseCareSchedule}
        dict={en}
        plantName="Monstera"
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/Monstera/)).toBeInTheDocument();
  });

  it('calls onComplete with the id when the complete button is clicked', () => {
    const onComplete = vi.fn();
    render(<CareScheduleRow careSchedule={baseCareSchedule} dict={en} onComplete={onComplete} onEdit={vi.fn()} onDelete={vi.fn()} />);
    screen.getByRole('button', { name: en.row.complete }).click();
    expect(onComplete).toHaveBeenCalledWith('cs-1');
  });

  it('calls onEdit with the care schedule when the edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<CareScheduleRow careSchedule={baseCareSchedule} dict={en} onComplete={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />);
    screen.getByRole('button', { name: en.row.edit }).click();
    expect(onEdit).toHaveBeenCalledWith(baseCareSchedule);
  });

  it('calls onDelete with the id when the delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<CareScheduleRow careSchedule={baseCareSchedule} dict={en} onComplete={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />);
    screen.getByRole('button', { name: en.row.delete }).click();
    expect(onDelete).toHaveBeenCalledWith('cs-1');
  });

  it('does not render an edit button when onEdit is not provided', () => {
    render(<CareScheduleRow careSchedule={baseCareSchedule} dict={en} onComplete={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByRole('button', { name: en.row.edit })).toBeNull();
  });

  it('does not render a complete button for an inactive (already completed one-time) schedule', () => {
    render(
      <CareScheduleRow
        careSchedule={{ ...baseCareSchedule, active: false }}
        dict={en}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: en.row.complete })).toBeNull();
  });
});
