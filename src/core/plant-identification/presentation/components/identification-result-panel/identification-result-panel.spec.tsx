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
    viewOtherCandidates: 'See other possibilities',
  },
  noMatch: {
    title: 'We could not identify this plant with confidence',
    fallbackToManual: 'You can still create the plant manually and search for its species.',
    candidatesTitle: 'Closest matches found',
  },
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

describe('IdentificationResultPanel', () => {
  it('renders nothing when there is no identification and no error', () => {
    const { container } = render(
      <IdentificationResultPanel identification={null} error={null} dict={dict} onCreatePlant={vi.fn()} onRetry={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  describe('resolved state', () => {
    it('shows the resolved species name and confidence', () => {
      render(
        <IdentificationResultPanel
          identification={resolvedIdentification}
          error={null}
          dict={dict}
          onCreatePlant={vi.fn()}
          onRetry={vi.fn()}
        />,
      );

      expect(screen.getByTestId('identification-result-resolved')).toBeInTheDocument();
      expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();
      expect(screen.getByText(/92%/)).toBeInTheDocument();
    });

    it('calls onCreatePlant when the CTA is clicked', async () => {
      const onCreatePlant = vi.fn();
      const user = userEvent.setup();
      render(
        <IdentificationResultPanel
          identification={resolvedIdentification}
          error={null}
          dict={dict}
          onCreatePlant={onCreatePlant}
          onRetry={vi.fn()}
        />,
      );

      await user.click(screen.getByTestId('btn-create-plant-cta'));

      expect(onCreatePlant).toHaveBeenCalledOnce();
    });

    it('shows a disclosure with the other candidates when there is more than one', async () => {
      const user = userEvent.setup();
      render(
        <IdentificationResultPanel
          identification={resolvedIdentification}
          error={null}
          dict={dict}
          onCreatePlant={vi.fn()}
          onRetry={vi.fn()}
        />,
      );

      expect(screen.queryByText('Monstera adansonii')).not.toBeInTheDocument();
      await user.click(screen.getByText(dict.resolved.viewOtherCandidates));
      expect(screen.getByText('Monstera adansonii')).toBeInTheDocument();
    });

    it('does not show the disclosure when there is only one candidate', () => {
      render(
        <IdentificationResultPanel
          identification={{ ...resolvedIdentification, candidates: [resolvedIdentification.candidates[0]] }}
          error={null}
          dict={dict}
          onCreatePlant={vi.fn()}
          onRetry={vi.fn()}
        />,
      );

      expect(screen.queryByText(dict.resolved.viewOtherCandidates)).not.toBeInTheDocument();
    });
  });

  describe('no_match state', () => {
    it('shows the no-match title and fallback text, with no CTA', () => {
      render(
        <IdentificationResultPanel
          identification={noMatchIdentification}
          error={null}
          dict={dict}
          onCreatePlant={vi.fn()}
          onRetry={vi.fn()}
        />,
      );

      expect(screen.getByTestId('identification-result-no-match')).toBeInTheDocument();
      expect(screen.getByText(dict.noMatch.title)).toBeInTheDocument();
      expect(screen.getByText(dict.noMatch.fallbackToManual)).toBeInTheDocument();
      expect(screen.queryByTestId('btn-create-plant-cta')).not.toBeInTheDocument();
    });

    it('shows any candidates PlantNet found', () => {
      render(
        <IdentificationResultPanel
          identification={noMatchIdentification}
          error={null}
          dict={dict}
          onCreatePlant={vi.fn()}
          onRetry={vi.fn()}
        />,
      );

      expect(screen.getByText('Ficus lyrata')).toBeInTheDocument();
    });

    it('does not show a candidates section when there are none', () => {
      render(
        <IdentificationResultPanel
          identification={{ ...noMatchIdentification, candidates: [] }}
          error={null}
          dict={dict}
          onCreatePlant={vi.fn()}
          onRetry={vi.fn()}
        />,
      );

      expect(screen.queryByText(dict.noMatch.candidatesTitle)).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows the provider-unavailable message, distinct from no_match copy, with a retry action', async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      render(
        <IdentificationResultPanel identification={null} error="provider" dict={dict} onCreatePlant={vi.fn()} onRetry={onRetry} />,
      );

      expect(screen.getByTestId('identification-result-error')).toBeInTheDocument();
      expect(screen.getByText(dict.error.provider)).toBeInTheDocument();
      expect(screen.queryByText(dict.noMatch.title)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: dict.error.retry }));
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('shows the quota message', () => {
      render(
        <IdentificationResultPanel identification={null} error="quota" dict={dict} onCreatePlant={vi.fn()} onRetry={vi.fn()} />,
      );

      expect(screen.getByText(dict.error.quota)).toBeInTheDocument();
    });

    it('takes priority over a stale identification result', () => {
      render(
        <IdentificationResultPanel
          identification={resolvedIdentification}
          error="provider"
          dict={dict}
          onCreatePlant={vi.fn()}
          onRetry={vi.fn()}
        />,
      );

      expect(screen.getByTestId('identification-result-error')).toBeInTheDocument();
      expect(screen.queryByTestId('identification-result-resolved')).not.toBeInTheDocument();
    });
  });
});
