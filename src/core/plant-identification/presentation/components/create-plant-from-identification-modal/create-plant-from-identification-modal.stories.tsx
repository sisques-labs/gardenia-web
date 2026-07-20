import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreatePlantFromIdentificationModal } from './create-plant-from-identification-modal';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const identification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [{ scientificName: 'Monstera deliciosa', commonNames: ['Costilla de Adán'], score: 0.92 }],
  photos: [{ url: 'https://placehold.co/400x200/2f5233/ffffff?text=Monstera', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

const meta = {
  title: 'PlantIdentification/CreatePlantFromIdentificationModal',
  component: CreatePlantFromIdentificationModal,
  tags: ['autodocs'],
  args: {
    identification,
    dict: getDictionary('es').plantIdentification.createModal,
    onClose: () => {},
    onSuccess: () => {},
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof CreatePlantFromIdentificationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
