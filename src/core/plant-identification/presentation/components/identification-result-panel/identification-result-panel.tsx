'use client';

import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Card, CardContent, CardHeader } from '@/shared/presentation/components/ui/card/card';
import { CandidateSelectionList } from '@/core/plant-identification/presentation/components/candidate-selection-list/candidate-selection-list';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type IdentificationResultPanelDict = Pick<AppDict['plantIdentification'], 'resolved' | 'noMatch' | 'noneMatch' | 'error'>;

interface Props {
  identification: PlantIdentification | null;
  error: 'provider' | 'quota' | null;
  dict: IdentificationResultPanelDict;
  selectedIndex: number | null;
  onSelectCandidate: (index: number) => void;
  onConfirm: () => void;
  onNoneMatch: () => void;
  onRetry: () => void;
}

export function IdentificationResultPanel({
  identification,
  error,
  dict,
  selectedIndex,
  onSelectCandidate,
  onConfirm,
  onNoneMatch,
  onRetry,
}: Props) {
  if (error) {
    return (
      <Card data-testid="identification-result-error">
        <CardContent className="flex flex-col gap-3 pt-6">
          <Alert variant="error" title={dict.error.title} message={dict.error[error]} />
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            {dict.error.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!identification) return null;

  const isResolved = identification.status === 'resolved' && identification.resolved != null;

  return (
    <Card data-testid={isResolved ? 'identification-result-resolved' : 'identification-result-no-match'}>
      <CardHeader>
        {isResolved ? (
          <span className="font-serif text-lg italic">{dict.resolved.title}</span>
        ) : (
          <Alert variant="info" title={dict.noMatch.title} message={dict.noMatch.candidatesTitle} />
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {identification.candidates.length > 0 && (
          <CandidateSelectionList
            candidates={identification.candidates}
            selectedIndex={selectedIndex}
            onSelect={onSelectCandidate}
          />
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            data-testid="btn-confirm-species"
            disabled={selectedIndex === null}
            onClick={onConfirm}
            className="min-h-11"
          >
            {dict.resolved.createPlantCta}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="btn-none-match"
            onClick={onNoneMatch}
            className="min-h-11"
          >
            {dict.noneMatch}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
