import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GrowthTimeline } from './growth-timeline';

const stages = [
  { name: 'Seed', daysStart: 0, daysEnd: 14, color: 'var(--sage)' },
  { name: 'Seedling', daysStart: 14, daysEnd: 28, color: 'var(--forest)' },
  { name: 'Vegetative', daysStart: 28, daysEnd: 45, color: 'var(--honey)' },
  { name: 'Fruiting', daysStart: 45, daysEnd: 64, color: 'var(--terracotta)' },
];

describe('GrowthTimeline', () => {
  it('renders data-testid="growth-timeline"', () => {
    render(<GrowthTimeline stages={stages} currentDay={36} totalDays={64} />);

    expect(screen.getByTestId('growth-timeline')).toBeInTheDocument();
  });

  it('renders each stage with correct testid', () => {
    render(<GrowthTimeline stages={stages} currentDay={36} totalDays={64} />);

    expect(screen.getByTestId('stage-seed')).toBeInTheDocument();
    expect(screen.getByTestId('stage-seedling')).toBeInTheDocument();
    expect(screen.getByTestId('stage-vegetative')).toBeInTheDocument();
    expect(screen.getByTestId('stage-fruiting')).toBeInTheDocument();
  });

  it('renders current-day-marker', () => {
    render(<GrowthTimeline stages={stages} currentDay={36} totalDays={64} />);

    expect(screen.getByTestId('current-day-marker')).toBeInTheDocument();
  });

  it('renders start and end dates when provided', () => {
    render(
      <GrowthTimeline
        stages={stages}
        currentDay={36}
        totalDays={64}
        startDate="Jan 1"
        estimatedEndDate="Mar 5"
      />
    );

    expect(screen.getByTestId('start-date')).toHaveTextContent('Jan 1');
    expect(screen.getByTestId('end-date')).toHaveTextContent('Mar 5');
  });

  it('does NOT render date row when neither date provided', () => {
    render(<GrowthTimeline stages={stages} currentDay={36} totalDays={64} />);

    expect(screen.queryByTestId('start-date')).not.toBeInTheDocument();
    expect(screen.queryByTestId('end-date')).not.toBeInTheDocument();
  });
});
