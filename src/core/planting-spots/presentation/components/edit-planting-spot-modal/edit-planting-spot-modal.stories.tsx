import type { Meta, StoryObj } from '@storybook/react';
import { EditPlantingSpotModal } from './edit-planting-spot-modal';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';

const mockSpot = {
  id: 'spot-1',
  name: 'Bancal principal',
  type: 'RAISED_BED' as const,
  description: 'Bancal soleado junto a la valla',
  capacity: 6,
  row: 1,
  column: 2,
  dimensionsWidth: 1.2,
  dimensionsHeight: 0.4,
  dimensionsLength: 2,
  soilType: 'Franco',
  status: 'ACTIVE' as const,
  fallowSince: null,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const meta = {
  title: 'PlantingSpots/EditPlantingSpotModal',
  component: EditPlantingSpotModal,
  tags: ['autodocs'],
  args: { spot: mockSpot, dict: getDictionary('es').plantingSpots, onClose: () => {} },
} satisfies Meta<typeof EditPlantingSpotModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
