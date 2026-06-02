import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import { PlantCard } from './plant-card';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
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
});
