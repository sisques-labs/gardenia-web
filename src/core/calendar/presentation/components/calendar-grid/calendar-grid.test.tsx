import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CalendarGrid } from './calendar-grid';

const dict = {
  weekdays: { mon: 'L', tue: 'M', wed: 'X', thu: 'J', fri: 'V', sat: 'S', sun: 'D' },
  seasons: {
    spring: 'primavera',
    summer: 'verano',
    autumn: 'otoño',
    winter: 'invierno',
  },
  overflow: 'más',
  months: {
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre',
  },
  viewSwitcher: { day: 'Día', week: 'Semana', month: 'Mes', year: 'Año' },
};

const baseProps = {
  year: 2026,
  month: 4, // May
  selectedDate: '2026-05-10',
  onSelectDate: vi.fn(),
  onPrevMonth: vi.fn(),
  onNextMonth: vi.fn(),
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
    // days 1-31 as buttons
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

  it('prev-month button fires onPrevMonth', async () => {
    const onPrevMonth = vi.fn();
    render(<CalendarGrid {...baseProps} onPrevMonth={onPrevMonth} />);
    await userEvent.click(screen.getByRole('button', { name: /mes anterior/i }));
    expect(onPrevMonth).toHaveBeenCalledOnce();
  });

  it('next-month button fires onNextMonth', async () => {
    const onNextMonth = vi.fn();
    render(<CalendarGrid {...baseProps} onNextMonth={onNextMonth} />);
    await userEvent.click(screen.getByRole('button', { name: /mes siguiente/i }));
    expect(onNextMonth).toHaveBeenCalledOnce();
  });

  it('header contains month name and year', () => {
    render(<CalendarGrid {...baseProps} />);
    expect(screen.getByText(/Mayo/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('header contains a season label', () => {
    render(<CalendarGrid {...baseProps} />);
    expect(screen.getByText(/primavera/i)).toBeInTheDocument();
  });
});
