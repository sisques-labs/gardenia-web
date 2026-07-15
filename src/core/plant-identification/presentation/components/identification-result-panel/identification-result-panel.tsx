'use client';

import { Accordion } from '@/shared/presentation/components/ui/accordion/accordion';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { ProgressBar } from '@/shared/presentation/components/ui/progress-bar/progress-bar';
import type {
  PlantIdentification,
  PlantIdentificationCandidate,
} from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type IdentificationResultPanelDict = Pick<AppDict['plantIdentification'], 'resolved' | 'noMatch' | 'error'>;

interface Props {
  identification: PlantIdentification | null;
  error: 'provider' | 'quota' | null;
  dict: IdentificationResultPanelDict;
  onCreatePlant: () => void;
  onRetry: () => void;
}

function CandidateRow({ candidate }: { candidate: PlantIdentificationCandidate }) {
  const percent = Math.round(candidate.score * 100);
  return (
    <div className="flex flex-col gap-1" data-testid={`candidate-${candidate.scientificName}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="italic">{candidate.scientificName}</span>
        <span className="text-xs text-ink-3">{percent}%</span>
      </div>
      <ProgressBar value={percent} />
    </div>
  );
}

export function IdentificationResultPanel({ identification, error, dict, onCreatePlant, onRetry }: Props) {
  if (error) {
    return (
      <div data-testid="identification-result-error" className="flex flex-col gap-3">
        <Alert variant="error" title={dict.error.title} message={dict.error[error]} />
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {dict.error.retry}
        </Button>
      </div>
    );
  }

  if (!identification) return null;

  if (identification.status === 'resolved' && identification.resolved) {
    const { resolved, candidates } = identification;
    const topCandidate =
      candidates.find((candidate) => candidate.scientificName === resolved.scientificName) ?? candidates[0];

    return (
      <div data-testid="identification-result-resolved" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-2">{dict.resolved.title}</span>
          <span className="font-serif text-lg italic">{resolved.scientificName}</span>
          {topCandidate && (
            <span className="text-xs text-ink-3">
              {dict.resolved.confidence}: {Math.round(topCandidate.score * 100)}%
            </span>
          )}
        </div>

        <Button type="button" data-testid="btn-create-plant-cta" onClick={onCreatePlant}>
          {dict.resolved.createPlantCta}
        </Button>

        {candidates.length > 1 && (
          <Accordion
            items={[
              {
                id: 'other-candidates',
                title: dict.resolved.viewOtherCandidates,
                content: (
                  <div className="flex flex-col gap-3">
                    {candidates.map((candidate) => (
                      <CandidateRow key={candidate.scientificName} candidate={candidate} />
                    ))}
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    );
  }

  return (
    <div data-testid="identification-result-no-match" className="flex flex-col gap-4">
      <Alert variant="info" title={dict.noMatch.title} message={dict.noMatch.fallbackToManual} />
      {identification.candidates.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-sm text-ink-2">{dict.noMatch.candidatesTitle}</span>
          {identification.candidates.map((candidate) => (
            <CandidateRow key={candidate.scientificName} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}
