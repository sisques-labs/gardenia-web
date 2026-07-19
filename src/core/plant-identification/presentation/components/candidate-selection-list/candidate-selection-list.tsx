'use client';

import { ProgressBar } from '@/shared/presentation/components/ui/progress-bar/progress-bar';
import { cn } from '@/shared/lib/utils';
import type { PlantIdentificationCandidate } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

interface Props {
  candidates: PlantIdentificationCandidate[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function CandidateSelectionList({ candidates, selectedIndex, onSelect }: Props) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2" data-testid="candidate-selection-list">
      {candidates.map((candidate, index) => {
        const percent = Math.round(candidate.score * 100);
        const isSelected = index === selectedIndex;
        return (
          <button
            key={`${candidate.scientificName}-${index}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-testid={`candidate-option-${index}`}
            onClick={() => onSelect(index)}
            className={cn(
              'flex flex-col gap-1 rounded-md border p-3 text-left transition-colors',
              isSelected ? 'border-[var(--forest-2)] bg-[var(--paper-2)]' : 'border-rule hover:bg-[var(--paper-2)]',
            )}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="italic">{candidate.scientificName}</span>
              <span className="text-xs text-ink-3">{percent}%</span>
            </div>
            <ProgressBar value={percent} />
          </button>
        );
      })}
    </div>
  );
}
