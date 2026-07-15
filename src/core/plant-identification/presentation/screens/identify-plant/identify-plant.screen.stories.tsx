import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IdentifyPlantScreen } from './identify-plant.screen';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const dict = getDictionary('es').plantIdentification;

const recentItems: PlantIdentification[] = [
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

function withSeededQuery(data: { items: PlantIdentification[]; total: number }) {
  function SeededQueryDecorator(Story: () => React.ReactElement) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['plant-identifications', 'space-1'], data);
    return (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    );
  }
  return SeededQueryDecorator;
}

const meta = {
  title: 'PlantIdentification/Screens/IdentifyPlant',
  component: IdentifyPlantScreen,
  tags: ['autodocs'],
  args: { dict, lang: 'es', spaceId: 'space-1' },
  decorators: [withSeededQuery({ items: recentItems, total: recentItems.length })],
} satisfies Meta<typeof IdentifyPlantScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyHistory: Story = {
  decorators: [withSeededQuery({ items: [], total: 0 })],
};
