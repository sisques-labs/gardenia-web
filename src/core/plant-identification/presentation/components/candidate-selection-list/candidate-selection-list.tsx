'use client';

import { Check, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/shared/presentation/components/ui/badge/badge';
import { ProgressBar } from '@/shared/presentation/components/ui/progress-bar/progress-bar';
import { cn } from '@/shared/lib/utils';
import type { PlantIdentificationCandidate } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

interface Props {
  candidates: PlantIdentificationCandidate[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

type ConfidenceTier = 'high' | 'medium' | 'low';

const TIER_BADGE_VARIANT: Record<ConfidenceTier, 'forest' | 'honey' | 'terra'> = {
  high: 'forest',
  medium: 'honey',
  low: 'terra',
};

const TIER_ICON: Record<ConfidenceTier, typeof TrendingUp> = {
  high: TrendingUp,
  medium: Minus,
  low: TrendingDown,
};

function confidenceTier(score: number): ConfidenceTier {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

export function CandidateSelectionList({ candidates, selectedIndex, onSelect }: Props) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2" data-testid="candidate-selection-list">
      {candidates.map((candidate, index) => {
        const percent = Math.round(candidate.score * 100);
        const tier = confidenceTier(candidate.score);
        const TierIcon = TIER_ICON[tier];
        const isSelected = index === selectedIndex;
        const commonName = candidate.commonNames[0];

        return (
          <button
            key={candidate.scientificName}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-testid={`candidate-option-${index}`}
            onClick={() => onSelect(index)}
            className={cn(
              'relative flex min-h-11 flex-col gap-2 rounded-lg border p-3 pr-10 text-left transition-colors',
              isSelected ? 'border-[var(--forest-2)] bg-[var(--paper-2)]' : 'border-rule hover:bg-[var(--paper-2)]',
            )}
          >
            {isSelected && (
              <span
                data-testid={`candidate-selected-marker-${index}`}
                className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--forest)] text-white"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            )}

            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-ink-3">#{index + 1}</span>
                <span className="italic">{candidate.scientificName}</span>
              </div>
              {commonName && (
                <span data-testid={`candidate-common-name-${index}`} className="truncate text-xs text-ink-3">
                  {commonName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={TIER_BADGE_VARIANT[tier]}
                data-testid={`candidate-confidence-tier-${index}`}
                data-tier={tier}
                className="flex shrink-0 items-center gap-1"
              >
                <TierIcon className="h-3 w-3" aria-hidden="true" />
                {percent}%
              </Badge>
              <ProgressBar value={percent} className="flex-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
