import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CandidateSelectionList } from './candidate-selection-list';
import type { PlantIdentificationCandidate } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const CANDIDATES: PlantIdentificationCandidate[] = [
  { scientificName: 'Monstera deliciosa', commonNames: ['Swiss cheese plant'], score: 0.82 },
  { scientificName: 'Monstera adansonii', commonNames: [], score: 0.11 },
  { scientificName: 'Epipremnum aureum', commonNames: ['Pothos'], score: 0.04 },
];

function CandidateSelectionListDemo({ initialSelectedIndex = null }: { initialSelectedIndex?: number | null }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(initialSelectedIndex);
  return <CandidateSelectionList candidates={CANDIDATES} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />;
}

const meta = {
  title: 'PlantIdentification/CandidateSelectionList',
  component: CandidateSelectionListDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof CandidateSelectionListDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NothingSelected: Story = { args: {} };

export const TopCandidatePreselected: Story = {
  args: { initialSelectedIndex: 0 },
};

export const LowerRankedSelected: Story = {
  args: { initialSelectedIndex: 2 },
};
