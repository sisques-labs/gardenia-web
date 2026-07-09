import type { Meta, StoryObj } from '@storybook/react';
import { CreatePlantingSpotModal } from './create-planting-spot-modal';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';

const meta = {
  title: 'PlantingSpots/CreatePlantingSpotModal',
  component: CreatePlantingSpotModal,
  tags: ['autodocs'],
  args: { dict: getDictionary('es').plantingSpots, onClose: () => {} },
} satisfies Meta<typeof CreatePlantingSpotModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
