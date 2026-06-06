import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DayTasksPanel } from './day-tasks-panel';
import { toISODate } from '../../utils/calendar.utils';

vi.mock('@/shared/presentation/components/in-development/in-development', () => ({
  InDevelopment: ({ label }: { label?: string }) => (
    <div data-testid="in-development-mock">{label}</div>
  ),
}));

const dict = {
  todayPrefix: 'Hoy',
  inDevLabel: 'Tareas del día',
};

describe('DayTasksPanel — header', () => {
  it('shows "Hoy" prefix when selectedDate is today', () => {
    const todayISO = toISODate(new Date());
    render(<DayTasksPanel selectedDate={todayISO} dict={dict} />);
    expect(screen.getByText(/Hoy/)).toBeInTheDocument();
  });

  it('does NOT show "Hoy" for a non-today date', () => {
    render(<DayTasksPanel selectedDate="2020-01-01" dict={dict} />);
    expect(screen.queryByText(/Hoy/)).toBeNull();
  });

  it('shows formatted day and month for any date', () => {
    render(<DayTasksPanel selectedDate="2026-05-18" dict={dict} />);
    // should contain some representation of 18 and May
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });
});

describe('DayTasksPanel — body', () => {
  it('renders InDevelopment component in the body', () => {
    render(<DayTasksPanel selectedDate="2026-05-18" dict={dict} />);
    expect(screen.getByTestId('in-development-mock')).toBeInTheDocument();
  });

  it('passes inDevLabel to InDevelopment', () => {
    render(<DayTasksPanel selectedDate="2026-05-18" dict={dict} />);
    expect(screen.getByText('Tareas del día')).toBeInTheDocument();
  });
});
