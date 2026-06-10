import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskStatusBadge } from './task-status-badge';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';

describe('TaskStatusBadge', () => {
  it('renders with neutral chip class for pending status', () => {
    render(<TaskStatusBadge status={TaskStatus.Pending} />);
    const badge = screen.getByTestId('task-status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('chip');
  });

  it('renders with forest chip class for active status', () => {
    render(<TaskStatusBadge status={TaskStatus.Active} />);
    const badge = screen.getByTestId('task-status-badge');
    expect(badge).toHaveClass('chip');
    expect(badge).toHaveClass('forest');
  });

  it('renders with sage chip class for completed status', () => {
    render(<TaskStatusBadge status={TaskStatus.Completed} />);
    const badge = screen.getByTestId('task-status-badge');
    expect(badge).toHaveClass('chip');
    expect(badge).toHaveClass('sage');
  });

  it('renders with terra chip class for failed status', () => {
    render(<TaskStatusBadge status={TaskStatus.Failed} />);
    const badge = screen.getByTestId('task-status-badge');
    expect(badge).toHaveClass('chip');
    expect(badge).toHaveClass('terra');
  });

  it('renders with outline chip class for cancelled status', () => {
    render(<TaskStatusBadge status={TaskStatus.Cancelled} />);
    const badge = screen.getByTestId('task-status-badge');
    expect(badge).toHaveClass('chip');
    expect(badge).toHaveClass('outline');
  });

  it('displays the status text', () => {
    render(<TaskStatusBadge status={TaskStatus.Completed} />);
    expect(screen.getByTestId('task-status-badge')).toHaveTextContent('completed');
  });
});
