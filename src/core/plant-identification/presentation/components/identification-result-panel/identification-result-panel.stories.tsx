import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IdentificationResultPanel } from './identification-result-panel';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const dict = getDictionary('es').plantIdentification;

const resolvedIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [
    { scientificName: 'Monstera deliciosa', commonNames: ['Costilla de Adán'], score: 0.92 },
    { scientificName: 'Monstera adansonii', commonNames: [], score: 0.05 },
    { scientificName: 'Philodendron bipinnatifidum', commonNames: [], score: 0.03 },
  ],
  photos: [{ url: 'https://placehold.co/400x300/2f5233/ffffff?text=Monstera', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

const noMatchIdentification: PlantIdentification = {
  id: 'ident-2',
  status: 'no_match',
  resolved: null,
  candidates: [
    { scientificName: 'Ficus lyrata', commonNames: [], score: 0.22 },
    { scientificName: 'Ficus elastica', commonNames: [], score: 0.18 },
  ],
  photos: [{ url: 'https://placehold.co/400x300/6b7c3c/ffffff?text=%3F', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

function IdentificationResultPanelDemo({
  identification,
  error = null,
  initialSelectedIndex = null,
}: {
  identification: PlantIdentification | null;
  error?: 'provider' | 'quota' | null;
  initialSelectedIndex?: number | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(initialSelectedIndex);
  return (
    <IdentificationResultPanel
      identification={identification}
      error={error}
      dict={dict}
      selectedIndex={selectedIndex}
      onSelectCandidate={setSelectedIndex}
      onConfirm={() => {}}
      onNoneMatch={() => {}}
      onRetry={() => {}}
    />
  );
}

const meta = {
  title: 'PlantIdentification/IdentificationResultPanel',
  component: IdentificationResultPanelDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof IdentificationResultPanelDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Resolved: Story = {
  args: { identification: resolvedIdentification, initialSelectedIndex: 0 },
};

export const ResolvedNothingSelectedYet: Story = {
  args: { identification: resolvedIdentification },
};

export const NoMatch: Story = {
  args: { identification: noMatchIdentification },
};

export const NoMatchWithoutCandidates: Story = {
  args: { identification: { ...noMatchIdentification, candidates: [] } },
};

export const ProviderError: Story = {
  args: { identification: null, error: 'provider' },
};

export const QuotaError: Story = {
  args: { identification: null, error: 'quota' },
};
