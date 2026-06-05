import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import { PlantCard } from './plant-card';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const basePlant: Plant = {
  id: 'p1',
  name: 'Monstera',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '',
  updatedAt: '',
};

describe('PlantCard', () => {
  it('renders the plant name', () => {
    render(<PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" />);
    expect(screen.getByText('Monstera')).toBeInTheDocument();
  });

  it('renders species name when present', () => {
    const plant: Plant = {
      ...basePlant,
      species: { id: 'sp1', name: 'Monstera deliciosa', createdAt: '', updatedAt: '' },
    };
    render(<PlantCard plant={plant} lang="en" noSpecies="Unknown species" />);
    expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();
  });

  it('renders noSpecies fallback when species is absent', () => {
    render(<PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" />);
    expect(screen.getByText('Unknown species')).toBeInTheDocument();
  });

  it('renders an img tag when imageUrl is present', () => {
    const plant: Plant = { ...basePlant, imageUrl: 'https://example.com/plant.jpg' };
    render(<PlantCard plant={plant} lang="en" noSpecies="Unknown species" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders letter avatar when imageUrl is absent', () => {
    render(<PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" />);
    // first letter of name
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('links to the plant detail page', () => {
    render(<PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en/plants/p1');
  });

  it('container link has card class', () => {
    const { container } = render(
      <PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" />,
    );
    const link = container.querySelector('a');
    expect(link).toHaveClass('card');
  });

  it('renders StatusDot when status prop is provided', () => {
    const { container } = render(
      <PlantCard
        plant={basePlant}
        lang="en"
        noSpecies="Unknown species"
        status="good"
      />,
    );
    const dots = container.querySelectorAll('.dot-good');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('renders Chip with tag label when tag prop is provided', () => {
    const { container } = render(
      <PlantCard
        plant={basePlant}
        lang="en"
        noSpecies="Unknown species"
        tag="Herb"
      />,
    );
    expect(screen.getByText('Herb')).toBeInTheDocument();
    const chips = container.querySelectorAll('.chip');
    expect(chips.length).toBeGreaterThan(0);
  });
});
