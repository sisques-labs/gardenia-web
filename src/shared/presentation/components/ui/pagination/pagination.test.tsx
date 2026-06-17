import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './pagination';

describe('Pagination', () => {
  it('previous button is disabled on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    const prev = screen.getByLabelText('Previous page');
    expect(prev).toBeDisabled();
  });

  it('next button is disabled on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    const next = screen.getByLabelText('Next page');
    expect(next).toBeDisabled();
  });

  it('clicking a page button calls onPageChange with that page number', async () => {
    const fn = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={fn} />);
    await userEvent.click(screen.getByText('4'));
    expect(fn).toHaveBeenCalledWith(4);
  });

  it('merges className prop', () => {
    const { container } = render(<Pagination page={1} totalPages={3} onPageChange={() => {}} className="mt-4" />);
    expect(container.firstChild).toHaveClass('mt-4');
  });
});
