import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalendarViewSwitcher } from './calendar-view-switcher';

const dict = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year',
};

describe('CalendarViewSwitcher', () => {
  it('renders all four view tabs', () => {
    render(<CalendarViewSwitcher activeView="month" dict={dict} />);
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
  });

  it('Mes/Month tab is not disabled', () => {
    render(<CalendarViewSwitcher activeView="month" dict={dict} />);
    const monthBtn = screen.getByText('Month').closest('button');
    expect(monthBtn).not.toBeDisabled();
  });

  it('Day tab is disabled', () => {
    render(<CalendarViewSwitcher activeView="month" dict={dict} />);
    expect(screen.getByText('Day').closest('button')).toBeDisabled();
  });

  it('Week tab is disabled', () => {
    render(<CalendarViewSwitcher activeView="month" dict={dict} />);
    expect(screen.getByText('Week').closest('button')).toBeDisabled();
  });

  it('Year tab is disabled', () => {
    render(<CalendarViewSwitcher activeView="month" dict={dict} />);
    expect(screen.getByText('Year').closest('button')).toBeDisabled();
  });

  it('active tab has active-view class, inactive tabs do not', () => {
    render(<CalendarViewSwitcher activeView="month" dict={dict} />);
    const monthBtn = screen.getByText('Month').closest('button');
    const dayBtn = screen.getByText('Day').closest('button');
    expect(monthBtn).toHaveClass('active-view');
    expect(dayBtn).not.toHaveClass('active-view');
  });
});
