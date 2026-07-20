import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecentIdentificationsList } from './recent-identifications-list';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const dict = getDictionary('es').plantIdentification.recent;

const items: PlantIdentification[] = [
  {
    id: 'ident-1',
    status: 'resolved',
    resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
    candidates: [{ scientificName: 'Monstera deliciosa', commonNames: [], score: 0.92 }],
    photos: [{ url: 'https://placehold.co/80x80/2f5233/ffffff?text=M', organ: 'leaf' }],
    convertedToPlantId: 'plant-1',
    createdAt: '2026-06-28T10:00:00Z',
  },
  {
    id: 'ident-2',
    status: 'no_match',
    resolved: null,
    candidates: [],
    photos: [{ url: 'https://placehold.co/80x80/6b7c3c/ffffff?text=%3F', organ: 'leaf' }],
    convertedToPlantId: null,
    createdAt: '2026-06-25T10:00:00Z',
  },
];

function withSeededQuery(spaceId: string | null, data: { items: PlantIdentification[]; total: number }) {
  function SeededQueryDecorator(Story: () => React.ReactElement) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['plant-identifications', spaceId], data);
    return (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    );
  }
  return SeededQueryDecorator;
}

const meta = {
  title: 'PlantIdentification/RecentIdentificationsList',
  component: RecentIdentificationsList,
  tags: ['autodocs'],
  args: { spaceId: 'space-1', lang: 'es', dict },
} satisfies Meta<typeof RecentIdentificationsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHistory: Story = {
  decorators: [withSeededQuery('space-1', { items, total: items.length })],
};

export const Empty: Story = {
  decorators: [withSeededQuery('space-1', { items: [], total: 0 })],
};
