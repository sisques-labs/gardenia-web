import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const mockIdentifyMutate = vi.fn();
const mockCreateMutate = vi.fn();
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
    useCreatePlantFromIdentification: vi.fn(() => ({ mutate: mockCreateMutate, isPending: false, error: null })),
  }),
);

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

const resolvedIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [{ scientificName: 'Monstera deliciosa', commonNames: [], score: 0.92 }],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

const noMatchIdentification: PlantIdentification = {
  id: 'ident-2',
  status: 'no_match',
  resolved: null,
  candidates: [],
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
    render(<IdentifyPlantScreen dict={en} lang="en" spaceId="space-1" />);

    expect(screen.getByText(en.title)).toBeInTheDocument();
  });

  it('disables submit until at least one photo is added', async () => {
    render(<IdentifyPlantScreen dict={en} lang="en" spaceId="space-1" />);

    expect(screen.getByTestId('btn-submit-identify')).toBeDisabled();

    await addOnePhoto();

    expect(screen.getByTestId('btn-submit-identify')).not.toBeDisabled();
  });

  it('submits every added photo in a single identify() call', async () => {
    render(<IdentifyPlantScreen dict={en} lang="en" spaceId="space-1" />);
    const user = await addOnePhoto();

    await user.click(screen.getByTestId('btn-submit-identify'));

    expect(mockIdentifyMutate).toHaveBeenCalledOnce();
    const input = mockIdentifyMutate.mock.calls[0][0];
    expect(input.photos).toHaveLength(1);
    expect(input.photos[0].organ).toBe('leaf');
  });

  it('full resolved flow: shows the resolved species, opens the create modal, and redirects to the new plant on success', async () => {
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: resolvedIdentification,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useIdentifyPlant>);
    mockCreateMutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 'plant-99' });
    });

    render(<IdentifyPlantScreen dict={en} lang="en" spaceId="space-1" />);
    const user = userEvent.setup();

    expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();

    await user.click(screen.getByTestId('btn-create-plant-cta'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.type(screen.getByLabelText(en.createModal.nameLabel), 'My Monstera');
    await user.click(screen.getByRole('button', { name: en.createModal.submit }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { identificationId: 'ident-1', name: 'My Monstera' },
      expect.anything(),
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/en/plants/plant-99'));
  });

  it('no-match flow: shows the no-match state without a create CTA', () => {
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: noMatchIdentification,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useIdentifyPlant>);

    render(<IdentifyPlantScreen dict={en} lang="en" spaceId="space-1" />);

    expect(screen.getByText(en.noMatch.title)).toBeInTheDocument();
    expect(screen.queryByTestId('btn-create-plant-cta')).not.toBeInTheDocument();
  });

  it('provider error flow: shows a retryable error state distinct from no_match, and retry re-submits', async () => {
    vi.mocked(useIdentifyPlant).mockReturnValue({
      mutate: mockIdentifyMutate,
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Provider unavailable'),
    } as unknown as ReturnType<typeof useIdentifyPlant>);

    render(<IdentifyPlantScreen dict={en} lang="en" spaceId="space-1" />);
    const user = userEvent.setup();

    expect(screen.getByText(en.error.provider)).toBeInTheDocument();
    expect(screen.queryByText(en.noMatch.title)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: en.error.retry }));
    expect(mockIdentifyMutate).toHaveBeenCalled();
  });
});
