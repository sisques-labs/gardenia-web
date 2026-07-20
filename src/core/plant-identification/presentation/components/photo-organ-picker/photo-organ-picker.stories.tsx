import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PhotoOrganPicker, type PhotoOrganPickerPhoto } from './photo-organ-picker';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';

const dict = getDictionary('es').plantIdentification;

function makePhoto(id: string, organ: PhotoOrganPickerPhoto['organ']): PhotoOrganPickerPhoto {
  return {
    id,
    file: new File(['x'], `${id}.png`, { type: 'image/png' }),
    previewUrl: 'https://placehold.co/112x112/2f5233/ffffff?text=%F0%9F%8C%BF',
    organ,
  };
}

function PhotoOrganPickerDemo({ initialPhotos = [] }: { initialPhotos?: PhotoOrganPickerPhoto[] }) {
  const [photos, setPhotos] = useState<PhotoOrganPickerPhoto[]>(initialPhotos);
  return <PhotoOrganPicker photos={photos} onChange={setPhotos} dict={dict} />;
}

const meta = {
  title: 'PlantIdentification/PhotoOrganPicker',
  component: PhotoOrganPickerDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof PhotoOrganPickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: {} };

export const WithPhotos: Story = {
  args: {
    initialPhotos: [makePhoto('p1', 'leaf'), makePhoto('p2', 'flower')],
  },
};

export const MaxReached: Story = {
  args: {
    initialPhotos: Array.from({ length: 5 }, (_, i) => makePhoto(`p${i}`, 'leaf')),
  },
};
