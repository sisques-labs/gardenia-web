import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import homeDict from '@/core/home/presentation/i18n/en';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

const mockUsePlants = vi.fn();

vi.mock('@/core/plants/presentation/hooks/use-plants/use-plants.hook', () => ({
  usePlants: (...args: unknown[]) => mockUsePlants(...args),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 'space-1' }),
}));

import { GrowingNowSection } from './growing-now-section';

function plant(id: string, name: string): Plant {
  return { id, name, userId: 'u1', spaceId: 'space-1', createdAt: '2026-05-01', updatedAt: '2026-05-01' };
}

describe('GrowingNowSection', () => {
  it('shows the empty state when there are no active plants', () => {
    mockUsePlants.mockReturnValue({ data: [], isLoading: false });
    render(<GrowingNowSection dict={homeDict} />);
    expect(screen.getByText(homeDict.sections.growingNow.empty)).toBeInTheDocument();
  });

  it('renders a plant card per plant', () => {
    mockUsePlants.mockReturnValue({ data: [plant('p1', 'Tomate cherry'), plant('p2', 'Albahaca')], isLoading: false });
    render(<GrowingNowSection dict={homeDict} />);
    expect(screen.getByText('Tomate cherry')).toBeInTheDocument();
    expect(screen.getByText('Albahaca')).toBeInTheDocument();
  });

  it('shows an "and N more" hint beyond the visible cap', () => {
    const plants = Array.from({ length: 8 }, (_, i) => plant(`p${i}`, `Plant ${i}`));
    mockUsePlants.mockReturnValue({ data: plants, isLoading: false });
    render(<GrowingNowSection dict={homeDict} />);
    expect(screen.getByText(homeDict.sections.growingNow.andMore.replace('{count}', '2'))).toBeInTheDocument();
  });
});
