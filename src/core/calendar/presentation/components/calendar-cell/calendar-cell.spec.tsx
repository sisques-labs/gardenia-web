import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CalendarCell } from './calendar-cell';

const dict = { dayAriaLabel: 'Día {day}', todayBadge: 'hoy' };

describe('CalendarCell — null slot', () => {
  it('renders an aria-hidden placeholder when day is null', () => {
    const { container } = render(
      <CalendarCell day={null} isToday={false} isSelected={false} onSelect={vi.fn()} dict={dict} />
    );
    const slot = container.firstChild as HTMLElement;
    expect(slot).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render a button when day is null', () => {
    render(<CalendarCell day={null} isToday={false} isSelected={false} onSelect={vi.fn()} dict={dict} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('CalendarCell — day cell', () => {
  it('renders the day number', () => {
    render(<CalendarCell day={15} isToday={false} isSelected={false} onSelect={vi.fn()} dict={dict} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('applies today class when isToday is true', () => {
    const { container } = render(
      <CalendarCell day={15} isToday={true} isSelected={false} onSelect={vi.fn()} dict={dict} />
    );
    expect(container.firstChild).toHaveClass('is-today');
  });

  it('does not apply today class when isToday is false', () => {
    const { container } = render(
      <CalendarCell day={15} isToday={false} isSelected={false} onSelect={vi.fn()} dict={dict} />
    );
    expect(container.firstChild).not.toHaveClass('is-today');
  });

  it('sets aria-selected=true when isSelected', () => {
    render(<CalendarCell day={15} isToday={false} isSelected={true} onSelect={vi.fn()} dict={dict} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-selected', 'true');
  });

  it('sets aria-selected=false when not selected', () => {
    render(<CalendarCell day={15} isToday={false} isSelected={false} onSelect={vi.fn()} dict={dict} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelect with the day number on click', async () => {
    const onSelect = vi.fn();
    render(<CalendarCell day={7} isToday={false} isSelected={false} onSelect={onSelect} dict={dict} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(7);
  });
});

describe('CalendarCell — task count badge', () => {
  it('does not render a badge when taskCount is undefined', () => {
    render(<CalendarCell day={15} isToday={false} isSelected={false} onSelect={vi.fn()} dict={dict} />);
    expect(screen.queryByTestId('calendar-cell-task-count')).toBeNull();
  });

  it('does not render a badge when taskCount is 0', () => {
    render(<CalendarCell day={15} isToday={false} isSelected={false} onSelect={vi.fn()} dict={dict} taskCount={0} />);
    expect(screen.queryByTestId('calendar-cell-task-count')).toBeNull();
  });

  it('renders the task count when greater than 0', () => {
    render(<CalendarCell day={15} isToday={false} isSelected={false} onSelect={vi.fn()} dict={dict} taskCount={3} />);
    expect(screen.getByTestId('calendar-cell-task-count')).toHaveTextContent('3');
  });
});
