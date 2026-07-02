import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CalendarGrid } from './calendar-grid';

const dict = {
  weekdays: { mon: 'L', tue: 'M', wed: 'X', thu: 'J', fri: 'V', sat: 'S', sun: 'D' },
  dayAriaLabel: 'Día {day}',
  todayBadge: 'hoy',
};

const baseProps = {
  year: 2026,
  month: 4, // May
  selectedDate: '2026-05-10',
  onSelectDate: vi.fn(),
  dict,
};

describe('CalendarGrid', () => {
  it('renders 7 weekday column headers', () => {
    render(<CalendarGrid {...baseProps} />);
    const grid = screen.getByRole('grid');
    const headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
  });

  it('renders 31 day buttons for May 2026', () => {
    render(<CalendarGrid {...baseProps} />);
    const dayButtons = screen.getAllByRole('button', { name: /^Día \d+$/ });
    expect(dayButtons).toHaveLength(31);
  });

  it('renders 4 empty slots before day 1 for May 2026 (starts Friday)', () => {
    const { container } = render(<CalendarGrid {...baseProps} />);
    const nullSlots = container.querySelectorAll('[data-testid="calendar-empty-slot"]');
    expect(nullSlots).toHaveLength(4);
  });

  it('today cell has is-today class', () => {
    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    render(
      <CalendarGrid
        {...baseProps}
        year={today.getFullYear()}
        month={today.getMonth()}
        selectedDate={todayISO}
      />
    );
    const todayCell = screen.getByText(String(today.getDate())).closest('.is-today');
    expect(todayCell).not.toBeNull();
  });

  it('clicking a day fires onSelectDate with ISO string', async () => {
    const onSelectDate = vi.fn();
    render(<CalendarGrid {...baseProps} onSelectDate={onSelectDate} />);
    await userEvent.click(screen.getByRole('button', { name: 'Día 15' }));
    expect(onSelectDate).toHaveBeenCalledWith('2026-05-15');
  });
});
