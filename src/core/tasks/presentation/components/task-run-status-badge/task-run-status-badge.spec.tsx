import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskRunStatusBadge } from './task-run-status-badge';
import { TaskRunStatus } from '@/core/tasks/domain/interfaces/task-run-status.enum';

describe('TaskRunStatusBadge', () => {
  it('renders with neutral chip class for pending status', () => {
    render(<TaskRunStatusBadge status={TaskRunStatus.Pending} />);
    const badge = screen.getByTestId('task-run-status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('chip');
  });

  it('renders with forest chip class for running status', () => {
    render(<TaskRunStatusBadge status={TaskRunStatus.Running} />);
    const badge = screen.getByTestId('task-run-status-badge');
    expect(badge).toHaveClass('chip');
    expect(badge).toHaveClass('forest');
  });

  it('renders with sage chip class for completed status', () => {
    render(<TaskRunStatusBadge status={TaskRunStatus.Completed} />);
    const badge = screen.getByTestId('task-run-status-badge');
    expect(badge).toHaveClass('chip');
    expect(badge).toHaveClass('sage');
  });

  it('renders with terra chip class for failed status', () => {
    render(<TaskRunStatusBadge status={TaskRunStatus.Failed} />);
    const badge = screen.getByTestId('task-run-status-badge');
    expect(badge).toHaveClass('chip');
    expect(badge).toHaveClass('terra');
  });

  it('renders with outline chip class for cancelled status', () => {
    render(<TaskRunStatusBadge status={TaskRunStatus.Cancelled} />);
    const badge = screen.getByTestId('task-run-status-badge');
    expect(badge).toHaveClass('chip');
    expect(badge).toHaveClass('outline');
  });

  it('displays the status text', () => {
    render(<TaskRunStatusBadge status={TaskRunStatus.Running} />);
    expect(screen.getByTestId('task-run-status-badge')).toHaveTextContent('running');
  });
});
