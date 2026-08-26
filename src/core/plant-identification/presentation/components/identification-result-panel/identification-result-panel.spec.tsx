import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { IdentificationResultPanel } from './identification-result-panel';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const dict = {
  resolved: {
    title: 'We think this is:',
    confidence: 'Confidence',
    createPlantCta: 'Create plant with this species',
  },
  noMatch: {
    title: 'We could not identify this plant with confidence',
    candidatesTitle: 'Closest matches found',
  },
  noneMatch: 'None of these are correct',
  error: {
    title: 'Identification is unavailable',
    provider: 'The identification service is temporarily unavailable. Try again in a moment.',
    quota: 'The identification limit has been reached for now. Try again later.',
    retry: 'Try again',
  },
};

const resolvedIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [
    { scientificName: 'Monstera deliciosa', commonNames: ['Swiss cheese plant'], score: 0.92 },
    { scientificName: 'Monstera adansonii', commonNames: [], score: 0.05 },
  ],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

const noMatchIdentification: PlantIdentification = {
  id: 'ident-2',
  status: 'no_match',
  resolved: null,
  candidates: [{ scientificName: 'Ficus lyrata', commonNames: [], score: 0.2 }],
  photos: [{ url: '/api/files/file-2/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

function renderPanel(props: Partial<Parameters<typeof IdentificationResultPanel>[0]> = {}) {
  return render(
    <IdentificationResultPanel
      identification={null}
      error={null}
      dict={dict}
      selectedIndex={null}
      onSelectCandidate={vi.fn()}
      onConfirm={vi.fn()}
      onNoneMatch={vi.fn()}
      onRetry={vi.fn()}
      {...props}
    />,
  );
}

describe('IdentificationResultPanel', () => {
  it('renders nothing when there is no identification and no error', () => {
    const { container } = renderPanel();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders each state inside a bounded Card section', () => {
    renderPanel({ identification: resolvedIdentification });

    expect(screen.getByTestId('identification-result-resolved')).toHaveClass('card');
  });

  describe('resolved state', () => {
    it('shows every candidate, not just the resolved one', () => {
      renderPanel({ identification: resolvedIdentification });

      expect(screen.getByTestId('identification-result-resolved')).toBeInTheDocument();
      expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();
      expect(screen.getByText('Monstera adansonii')).toBeInTheDocument();
    });

    it('calls onSelectCandidate when a candidate is clicked', async () => {
      const onSelectCandidate = vi.fn();
      const user = userEvent.setup();
      renderPanel({ identification: resolvedIdentification, onSelectCandidate });

      await user.click(screen.getByTestId('candidate-option-1'));

      expect(onSelectCandidate).toHaveBeenCalledWith(1);
    });

    it('calls onConfirm when the CTA is clicked with a selection', async () => {
      const onConfirm = vi.fn();
      const user = userEvent.setup();
      renderPanel({ identification: resolvedIdentification, selectedIndex: 0, onConfirm });

      await user.click(screen.getByTestId('btn-confirm-species'));

      expect(onConfirm).toHaveBeenCalledOnce();
    });

    it('disables the confirm CTA when nothing is selected', () => {
      renderPanel({ identification: resolvedIdentification, selectedIndex: null });

      expect(screen.getByTestId('btn-confirm-species')).toBeDisabled();
    });
  });

  describe('no_match state', () => {
    it('shows the no-match title and every returned candidate, selectable', () => {
      renderPanel({ identification: noMatchIdentification });

      expect(screen.getByTestId('identification-result-no-match')).toBeInTheDocument();
      expect(screen.getByText(dict.noMatch.title)).toBeInTheDocument();
      expect(screen.getByText('Ficus lyrata')).toBeInTheDocument();
      expect(screen.getByTestId('candidate-option-0')).toBeInTheDocument();
    });

    it('allows confirming a candidate even though the identification is unresolved', async () => {
      const onConfirm = vi.fn();
      const user = userEvent.setup();
      renderPanel({ identification: noMatchIdentification, selectedIndex: 0, onConfirm });

      await user.click(screen.getByTestId('btn-confirm-species'));

      expect(onConfirm).toHaveBeenCalledOnce();
    });

    it('does not show a candidate list when there are none', () => {
      renderPanel({ identification: { ...noMatchIdentification, candidates: [] } });

      expect(screen.queryByTestId('candidate-selection-list')).not.toBeInTheDocument();
    });
  });

  describe('none-match fallback', () => {
    it('always shows a "none of these" action, for both statuses', () => {
      renderPanel({ identification: resolvedIdentification });
      expect(screen.getByTestId('btn-none-match')).toBeInTheDocument();
    });

    it('calls onNoneMatch when clicked', async () => {
      const onNoneMatch = vi.fn();
      const user = userEvent.setup();
      renderPanel({ identification: noMatchIdentification, onNoneMatch });

      await user.click(screen.getByTestId('btn-none-match'));

      expect(onNoneMatch).toHaveBeenCalledOnce();
    });
  });

  describe('error state', () => {
    it('shows the provider-unavailable message, distinct from no_match copy, with a retry action', async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      renderPanel({ error: 'provider', onRetry });

      expect(screen.getByTestId('identification-result-error')).toBeInTheDocument();
      expect(screen.getByText(dict.error.provider)).toBeInTheDocument();
      expect(screen.queryByText(dict.noMatch.title)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: dict.error.retry }));
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('shows the quota message', () => {
      renderPanel({ error: 'quota' });

      expect(screen.getByText(dict.error.quota)).toBeInTheDocument();
    });

    it('takes priority over a stale identification result', () => {
      renderPanel({ identification: resolvedIdentification, error: 'provider' });

      expect(screen.getByTestId('identification-result-error')).toBeInTheDocument();
      expect(screen.queryByTestId('identification-result-resolved')).not.toBeInTheDocument();
    });
  });
});
