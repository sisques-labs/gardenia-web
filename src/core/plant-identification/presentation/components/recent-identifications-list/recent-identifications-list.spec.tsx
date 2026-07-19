import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecentIdentificationsList } from './recent-identifications-list';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

vi.mock('@/core/plant-identification/presentation/hooks/use-plant-identifications/use-plant-identifications.hook', () => ({
  usePlantIdentifications: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { usePlantIdentifications } from '@/core/plant-identification/presentation/hooks/use-plant-identifications/use-plant-identifications.hook';

const dict = {
  title: 'Recent identifications',
  empty: 'No identifications yet',
  resolvedLabel: 'Identified',
  noMatchLabel: 'Not recognized',
  convertedBadge: 'Converted to plant',
  viewPlant: 'View plant',
};

const resolvedItem: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-03-01T10:00:00Z',
};

const convertedItem: PlantIdentification = {
  ...resolvedItem,
  id: 'ident-2',
  convertedToPlantId: 'plant-1',
};

const noMatchItem: PlantIdentification = {
  id: 'ident-3',
  status: 'no_match',
  resolved: null,
  candidates: [],
  photos: [],
  convertedToPlantId: null,
  createdAt: '2026-03-02T10:00:00Z',
};

describe('RecentIdentificationsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section title', () => {
    vi.mocked(usePlantIdentifications).mockReturnValue({ data: { items: [], total: 0 } } as unknown as ReturnType<
      typeof usePlantIdentifications
    >);

    render(<RecentIdentificationsList spaceId="space-1" lang="en" dict={dict} />);

    expect(screen.getByText(dict.title)).toBeInTheDocument();
  });

  it('shows the empty state when there are no identifications', () => {
    vi.mocked(usePlantIdentifications).mockReturnValue({ data: { items: [], total: 0 } } as unknown as ReturnType<
      typeof usePlantIdentifications
    >);

    render(<RecentIdentificationsList spaceId="space-1" lang="en" dict={dict} />);

    expect(screen.getByText(dict.empty)).toBeInTheDocument();
  });

  it('renders the resolved species name for a resolved identification', () => {
    vi.mocked(usePlantIdentifications).mockReturnValue({
      data: { items: [resolvedItem], total: 1 },
    } as unknown as ReturnType<typeof usePlantIdentifications>);

    render(<RecentIdentificationsList spaceId="space-1" lang="en" dict={dict} />);

    expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();
  });

  it('renders the not-recognized label for a no_match identification', () => {
    vi.mocked(usePlantIdentifications).mockReturnValue({
      data: { items: [noMatchItem], total: 1 },
    } as unknown as ReturnType<typeof usePlantIdentifications>);

    render(<RecentIdentificationsList spaceId="space-1" lang="en" dict={dict} />);

    expect(screen.getByText(dict.noMatchLabel)).toBeInTheDocument();
  });

  it('shows a converted badge and a link to the plant detail page when convertedToPlantId is set', () => {
    vi.mocked(usePlantIdentifications).mockReturnValue({
      data: { items: [convertedItem], total: 1 },
    } as unknown as ReturnType<typeof usePlantIdentifications>);

    render(<RecentIdentificationsList spaceId="space-1" lang="en" dict={dict} />);

    expect(screen.getByText(dict.convertedBadge)).toBeInTheDocument();
    const link = screen.getByTestId('link-plant-ident-2');
    expect(link).toHaveAttribute('href', '/en/plants/plant-1');
  });

  it('does not show a converted badge or link when the identification was not converted', () => {
    vi.mocked(usePlantIdentifications).mockReturnValue({
      data: { items: [resolvedItem], total: 1 },
    } as unknown as ReturnType<typeof usePlantIdentifications>);

    render(<RecentIdentificationsList spaceId="space-1" lang="en" dict={dict} />);

    expect(screen.queryByText(dict.convertedBadge)).not.toBeInTheDocument();
    expect(screen.queryByTestId('link-plant-ident-1')).not.toBeInTheDocument();
  });

  it('renders an item per identification', () => {
    vi.mocked(usePlantIdentifications).mockReturnValue({
      data: { items: [resolvedItem, noMatchItem], total: 2 },
    } as unknown as ReturnType<typeof usePlantIdentifications>);

    render(<RecentIdentificationsList spaceId="space-1" lang="en" dict={dict} />);

    expect(screen.getByTestId('recent-identification-ident-1')).toBeInTheDocument();
    expect(screen.getByTestId('recent-identification-ident-3')).toBeInTheDocument();
  });
});
