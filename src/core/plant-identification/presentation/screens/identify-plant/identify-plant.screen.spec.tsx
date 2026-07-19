import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const mockIdentifyMutate = vi.fn();
const mockCreateFromIdentificationMutate = vi.fn();
const mockCreatePlantMutate = vi.fn();
const mockPush = vi.fn();

vi.mock('@/core/plant-identification/presentation/hooks/use-identify-plant/use-identify-plant.hook', () => ({
  useIdentifyPlant: vi.fn(),
}));

vi.mock('@/core/plant-identification/presentation/hooks/use-plant-identifications/use-plant-identifications.hook', () => ({
  usePlantIdentifications: vi.fn(() => ({ data: { items: [], total: 0 } })),
}));

vi.mock(
  '@/core/plant-identification/presentation/hooks/use-create-plant-from-identification/use-create-plant-from-identification.hook',
  () => ({
    useCreatePlantFromIdentification: vi.fn(() => ({
      mutate: mockCreateFromIdentificationMutate,
      isPending: false,
      error: null,
    })),
  }),
);

vi.mock('@/core/plants/presentation/hooks/use-create-plant/use-create-plant.hook', () => ({
  useCreatePlant: vi.fn(() => ({ mutate: mockCreatePlantMutate, isPending: false, error: null })),
}));

vi.mock('@/core/plants/presentation/hooks/use-species-search/use-species-search.hook', () => ({
  useSpeciesSearch: vi.fn(() => ({ data: [], isFetching: false, isError: false })),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 'space-1' }),
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { useIdentifyPlant } from '@/core/plant-identification/presentation/hooks/use-identify-plant/use-identify-plant.hook';
import { IdentifyPlantScreen } from './identify-plant.screen';
import en from '@/core/plant-identification/presentation/i18n/en';
import plantsEn from '@/core/plants/presentation/i18n/en';

const createPlantDict = plantsEn.create;

const resolvedIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [
    { scientificName: 'Monstera deliciosa', commonNames: [], score: 0.92 },
    { scientificName: 'Monstera adansonii', commonNames: [], score: 0.05 },
  ],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

const noMatchIdentification: PlantIdentification = {
  id: 'ident-2',
  status: 'no_match',
  resolved: null,
  candidates: [{ scientificName: 'Ficus lyrata', commonNames: [], score: 0.2 }],
  photos: [{ url: '/api/files/file-2/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

async function addOnePhoto() {
  const user = userEvent.setup();
  const file = new File(['x'], 'leaf.png', { type: 'image/png' });
  const input = screen.getByTestId('photo-organ-picker-input') as HTMLInputElement;
  await user.upload(input, file);
  return user;
}

function renderScreen() {
  return render(<IdentifyPlantScreen dict={en} createPlantDict={createPlantDict} lang="en" spaceId="space-1" />);
}

describe('IdentifyPlantScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useIdentifyPlant>);
  });

  it('renders the screen title', () => {
    renderScreen();

    expect(screen.getByText(en.title)).toBeInTheDocument();
  });

  it('disables submit until at least one photo is added', async () => {
    renderScreen();

    expect(screen.getByTestId('btn-submit-identify')).toBeDisabled();

    await addOnePhoto();

    expect(screen.getByTestId('btn-submit-identify')).not.toBeDisabled();
  });

  it('submits every added photo in a single identify() call', async () => {
    renderScreen();
    const user = await addOnePhoto();

    await user.click(screen.getByTestId('btn-submit-identify'));

    expect(mockIdentifyMutate).toHaveBeenCalledOnce();
    const input = mockIdentifyMutate.mock.calls[0][0];
    expect(input.photos).toHaveLength(1);
    expect(input.photos[0].organ).toBe('leaf');
  });

  it('resolved flow: the auto-resolved candidate is pre-selected and confirming uses the identification mutation', async () => {
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: resolvedIdentification,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useIdentifyPlant>);
    mockCreateFromIdentificationMutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 'plant-99' });
    });

    renderScreen();
    const user = userEvent.setup();

    expect(screen.getByTestId('candidate-option-0')).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByTestId('btn-confirm-species'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.type(screen.getByLabelText(en.createModal.nameLabel), 'My Monstera');
    await user.click(screen.getByRole('button', { name: en.createModal.submit }));

    expect(mockCreateFromIdentificationMutate).toHaveBeenCalledWith(
      { identificationId: 'ident-1', name: 'My Monstera' },
      expect.anything(),
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/en/plants/plant-99'));
  });

  it('selecting a different candidate and confirming opens the manual create-plant form, pre-filled', async () => {
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: resolvedIdentification,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useIdentifyPlant>);

    renderScreen();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('candidate-option-1'));
    await user.click(screen.getByTestId('btn-confirm-species'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(createPlantDict.speciesSearch.label)).toHaveValue('Monstera adansonii');
    expect(screen.getByLabelText(createPlantDict.imageUrl)).toHaveValue('/api/files/file-1/content');
    expect(mockCreateFromIdentificationMutate).not.toHaveBeenCalled();
  });

  it('no-match flow: selecting a candidate and confirming opens the manual form', async () => {
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: noMatchIdentification,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useIdentifyPlant>);

    renderScreen();
    const user = userEvent.setup();

    expect(screen.getByText(en.noMatch.title)).toBeInTheDocument();

    await user.click(screen.getByTestId('candidate-option-0'));
    await user.click(screen.getByTestId('btn-confirm-species'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(createPlantDict.speciesSearch.label)).toHaveValue('Ficus lyrata');
  });

  it('"none of these" opens the manual form with no species pre-filled', async () => {
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: resolvedIdentification,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useIdentifyPlant>);

    renderScreen();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('btn-none-match'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(createPlantDict.speciesSearch.label)).toHaveValue('');
    expect(screen.getByLabelText(createPlantDict.imageUrl)).toHaveValue('/api/files/file-1/content');
  });

  it('provider error flow: shows a retryable error state distinct from no_match, and retry re-submits', async () => {
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Provider unavailable'),
    } as unknown as ReturnType<typeof useIdentifyPlant>);

    renderScreen();
    const user = userEvent.setup();

    expect(screen.getByText(en.error.provider)).toBeInTheDocument();
    expect(screen.queryByText(en.noMatch.title)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: en.error.retry }));
    expect(mockIdentifyMutate).toHaveBeenCalled();
  });
});
