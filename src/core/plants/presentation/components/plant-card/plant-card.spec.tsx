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

const cardDict = {
  delete: 'Delete plant',
  health: {
    good: 'Healthy',
    warn: 'Needs attention',
    bad: 'At risk',
    inactive: 'Inactive',
  },
};

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
    render(
      <PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" cardDict={cardDict} />,
    );
    expect(screen.getByText('Monstera')).toBeInTheDocument();
  });

  it('renders species name when present', () => {
    const plant: Plant = {
      ...basePlant,
      species: {
        id: 'sp1',
        scientificName: 'Monstera deliciosa',
        description: null,
        imageUrl: null,
        createdAt: '',
        updatedAt: '',
      },
    };
    render(
      <PlantCard plant={plant} lang="en" noSpecies="Unknown species" cardDict={cardDict} />,
    );
    expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();
  });

  it('renders noSpecies fallback when species is absent', () => {
    render(
      <PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" cardDict={cardDict} />,
    );
    expect(screen.getByText('Unknown species')).toBeInTheDocument();
  });

  it('renders an img tag when imageUrl is present', () => {
    const plant: Plant = { ...basePlant, imageUrl: 'https://example.com/plant.jpg' };
    render(
      <PlantCard plant={plant} lang="en" noSpecies="Unknown species" cardDict={cardDict} />,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders placeholder image when imageUrl is absent', () => {
    const { container } = render(
      <PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" cardDict={cardDict} />,
    );
    expect(container.querySelector('.placeholder-img.leaf')).toBeInTheDocument();
  });

  it('links to the plant detail page', () => {
    render(
      <PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" cardDict={cardDict} />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en/plants/p1');
  });

  it('container link has card class', () => {
    const { container } = render(
      <PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" cardDict={cardDict} />,
    );
    const link = container.querySelector('a');
    expect(link).toHaveClass('card');
  });

  it('renders health label and StatusDot when status prop is provided', () => {
    render(
      <PlantCard
        plant={basePlant}
        lang="en"
        noSpecies="Unknown species"
        cardDict={cardDict}
        status="good"
        careDate="2026-04-12T10:00:00.000Z"
      />,
    );
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('renders care label chip when careLabel prop is provided', () => {
    render(
      <PlantCard
        plant={basePlant}
        lang="en"
        noSpecies="Unknown species"
        cardDict={cardDict}
        careLabel="Watering"
      />,
    );
    expect(screen.getByText('Watering')).toBeInTheDocument();
  });

  it('renders formatted care date when careDate prop is provided', () => {
    render(
      <PlantCard
        plant={basePlant}
        lang="en"
        noSpecies="Unknown species"
        cardDict={cardDict}
        careDate="2026-04-12T10:00:00.000Z"
        status="good"
      />,
    );
    expect(screen.getByText(/Apr/i)).toBeInTheDocument();
  });

  it('does not render footer when careDate and status are absent', () => {
    const { container } = render(
      <PlantCard plant={basePlant} lang="en" noSpecies="Unknown species" cardDict={cardDict} />,
    );
    expect(container.querySelector('.dashed-rule')).not.toBeInTheDocument();
  });
});
