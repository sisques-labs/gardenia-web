import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
  describe('page count display', () => {
    it('shows 3 total pages for total=25 and pageSize=10', () => {
      render(<Pagination page={1} pageSize={10} total={25} onPageChange={vi.fn()} />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('shows 1 page for total=0', () => {
      render(<Pagination page={1} pageSize={10} total={0} onPageChange={vi.fn()} />);
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
    });

    it('shows correct page count for exact division (total=20, pageSize=10)', () => {
      render(<Pagination page={1} pageSize={10} total={20} onPageChange={vi.fn()} />);
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('rounds up for partial last page (total=21, pageSize=10)', () => {
      render(<Pagination page={1} pageSize={10} total={21} onPageChange={vi.fn()} />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  describe('onPageChange on navigation', () => {
    it('calls onPageChange with 2 when next is clicked from page 1', async () => {
      const onPageChange = vi.fn();
      render(<Pagination page={1} pageSize={10} total={25} onPageChange={onPageChange} />);

      await userEvent.click(screen.getByRole('button', { name: /next/i }));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange with page-1 when previous is clicked', async () => {
      const onPageChange = vi.fn();
      render(<Pagination page={2} pageSize={10} total={25} onPageChange={onPageChange} />);

      await userEvent.click(screen.getByRole('button', { name: /previous/i }));

      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('disabled states', () => {
    it('disables previous button on page 1', () => {
      render(<Pagination page={1} pageSize={10} total={25} onPageChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    it('does not disable previous button on page 2', () => {
      render(<Pagination page={2} pageSize={10} total={25} onPageChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
    });

    it('disables next button on last page (page=3, total=25, pageSize=10)', () => {
      render(<Pagination page={3} pageSize={10} total={25} onPageChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('does not disable next button before last page', () => {
      render(<Pagination page={1} pageSize={10} total={25} onPageChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
  });

  describe('does not own state', () => {
    it('does not change page on click without parent updating page prop', async () => {
      const onPageChange = vi.fn();
      const { rerender } = render(
        <Pagination page={1} pageSize={10} total={25} onPageChange={onPageChange} />,
      );
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      // page prop stays 1 — component is controlled
      rerender(<Pagination page={1} pageSize={10} total={25} onPageChange={onPageChange} />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });
});
