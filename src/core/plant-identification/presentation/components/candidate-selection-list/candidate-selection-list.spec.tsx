import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CandidateSelectionList } from './candidate-selection-list';
import type { PlantIdentificationCandidate } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const CANDIDATES: PlantIdentificationCandidate[] = [
  { scientificName: 'Monstera deliciosa', commonNames: ['Swiss cheese plant'], score: 0.82 },
  { scientificName: 'Monstera adansonii', commonNames: [], score: 0.11 },
  { scientificName: 'Epipremnum aureum', commonNames: ['Pothos'], score: 0.04 },
];

describe('CandidateSelectionList', () => {
  it('renders one option per candidate with its rank, scientific name, and rounded percentage', () => {
    render(<CandidateSelectionList candidates={CANDIDATES} selectedIndex={null} onSelect={vi.fn()} />);

    expect(screen.getByTestId('candidate-option-0')).toHaveTextContent('#1');
    expect(screen.getByTestId('candidate-option-0')).toHaveTextContent('Monstera deliciosa');
    expect(screen.getByTestId('candidate-option-0')).toHaveTextContent('82%');
    expect(screen.getByTestId('candidate-option-1')).toHaveTextContent('#2');
    expect(screen.getByTestId('candidate-option-1')).toHaveTextContent('Monstera adansonii');
    expect(screen.getByTestId('candidate-option-1')).toHaveTextContent('11%');
    expect(screen.getByTestId('candidate-option-2')).toHaveTextContent('#3');
    expect(screen.getByTestId('candidate-option-2')).toHaveTextContent('Epipremnum aureum');
    expect(screen.getByTestId('candidate-option-2')).toHaveTextContent('4%');
  });

  it('renders the first common name when present, and none when absent', () => {
    render(<CandidateSelectionList candidates={CANDIDATES} selectedIndex={null} onSelect={vi.fn()} />);

    expect(screen.getByTestId('candidate-option-0')).toHaveTextContent('Swiss cheese plant');
    expect(screen.queryByTestId('candidate-common-name-1')).not.toBeInTheDocument();
  });

  it.each([
    [0.85, 'high'],
    [0.7, 'high'],
    [0.69, 'medium'],
    [0.4, 'medium'],
    [0.39, 'low'],
    [0.1, 'low'],
  ])('marks a candidate with score %s as %s confidence', (score, tier) => {
    render(
      <CandidateSelectionList
        candidates={[{ scientificName: 'Test plant', commonNames: [], score }]}
        selectedIndex={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByTestId('candidate-confidence-tier-0')).toHaveAttribute('data-tier', tier);
  });

  it('marks only the selected index as checked, with a visible selected marker', () => {
    render(<CandidateSelectionList candidates={CANDIDATES} selectedIndex={1} onSelect={vi.fn()} />);

    expect(screen.getByTestId('candidate-option-0')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('candidate-option-1')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('candidate-option-2')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('candidate-selected-marker-1')).toBeInTheDocument();
    expect(screen.queryByTestId('candidate-selected-marker-0')).not.toBeInTheDocument();
  });

  it('calls onSelect with the clicked candidate index', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CandidateSelectionList candidates={CANDIDATES} selectedIndex={null} onSelect={onSelect} />);

    await user.click(screen.getByTestId('candidate-option-2'));

    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('renders nothing selected when selectedIndex is null', () => {
    render(<CandidateSelectionList candidates={CANDIDATES} selectedIndex={null} onSelect={vi.fn()} />);

    for (const option of screen.getAllByRole('radio')) {
      expect(option).toHaveAttribute('aria-checked', 'false');
    }
  });
});
