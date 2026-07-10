import type { Meta, StoryObj } from '@storybook/react';
import { SpeciesCombobox } from './species-combobox';
import { withQueryClient } from '../../../../../../.storybook/decorators/with-query-client';

const meta = {
  title: 'Plants/SpeciesCombobox',
  component: SpeciesCombobox,
  tags: ['autodocs'],
  args: { placeholder: 'Search species…' },
  decorators: [
    withQueryClient((qc) =>
      qc.setQueryData(['species-search', 'Monstera'], [
        { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
        { gbifKey: 5352251, scientificName: 'Monstera adansonii' },
      ]),
    ),
  ],
} satisfies Meta<typeof SpeciesCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithSelectedSpecies: Story = {
  args: { value: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' } },
};
