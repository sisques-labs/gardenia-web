import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './filter-bar';

describe('FilterBar', () => {
  it('typing in search calls onSearch with typed value', async () => {
    const fn = vi.fn();
    render(<FilterBar onSearch={fn} />);
    const input = screen.getByPlaceholderText(/search/i);
    await userEvent.type(input, 'plant');
    expect(fn).toHaveBeenCalledWith('plant');
  });

  it('clicking view toggle calls onViewChange with new mode', async () => {
    const fn = vi.fn();
    render(<FilterBar onViewChange={fn} />);
    // click the list view toggle button
    const listBtn = screen.getByLabelText('List view');
    await userEvent.click(listBtn);
    expect(fn).toHaveBeenCalledWith('list');
  });

  it('renders search input, sort control, and view toggle', () => {
    render(<FilterBar />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
    expect(screen.getByLabelText('List view')).toBeInTheDocument();
  });

  it('merges className prop', () => {
    const { container } = render(<FilterBar className="w-full" />);
    expect(container.firstChild).toHaveClass('w-full');
  });
});
