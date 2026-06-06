import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Droplets } from 'lucide-react';
import { CareCard } from './care-card';

describe('CareCard', () => {
  it('renders data-testid="care-card"', () => {
    render(
      <CareCard
        icon={<Droplets data-testid="icon" />}
        label="WATERING"
        title="Every day · 250 ml"
        description="Reduce to 200ml when flowering."
      />
    );

    expect(screen.getByTestId('care-card')).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(
      <CareCard
        icon={<Droplets />}
        label="WATERING"
        title="Every day · 250 ml"
        description="Reduce to 200ml when flowering."
      />
    );

    expect(screen.getByText('WATERING')).toBeInTheDocument();
  });

  it('renders title text', () => {
    render(
      <CareCard
        icon={<Droplets />}
        label="WATERING"
        title="Every day · 250 ml"
        description="Reduce to 200ml when flowering."
      />
    );

    expect(screen.getByText('Every day · 250 ml')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <CareCard
        icon={<Droplets />}
        label="WATERING"
        title="Every day · 250 ml"
        description="Reduce to 200ml when flowering."
      />
    );

    expect(screen.getByText('Reduce to 200ml when flowering.')).toBeInTheDocument();
  });

  it('applies labelVariant color class when provided', () => {
    render(
      <CareCard
        icon={<Droplets />}
        label="WATERING"
        labelVariant="forest"
        title="Every day · 250 ml"
        description="Reduce to 200ml when flowering."
      />
    );

    const label = screen.getByText('WATERING');
    expect(label).toHaveClass('text-[var(--forest)]');
  });
});
