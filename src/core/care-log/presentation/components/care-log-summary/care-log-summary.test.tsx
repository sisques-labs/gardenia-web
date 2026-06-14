import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CareLogSummary } from './care-log-summary';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { LastCareByType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { CareLogDict } from '@/core/care-log/presentation/i18n/en';

const mockDict: CareLogDict = {
  sectionTitle: 'Last care',
  empty: 'No care activities logged yet.',
  activityTypes: {
    [CareLogActivityType.WATERING]: 'Watering',
    [CareLogActivityType.FERTILIZING]: 'Fertilizing',
    [CareLogActivityType.PRUNING]: 'Pruning',
    [CareLogActivityType.REPOTTING]: 'Repotting',
    [CareLogActivityType.TRANSPLANTING]: 'Transplanting',
    [CareLogActivityType.PEST_TREATMENT]: 'Pest treatment',
    [CareLogActivityType.MISTING]: 'Misting',
    [CareLogActivityType.ROTATION]: 'Rotation',
    [CareLogActivityType.OTHER]: 'Other',
  },
} as const;

const makeEntry = (activityType: CareLogActivityType, performedAt = '2024-01-10T10:00:00.000Z') => ({
  id: 'entry-1',
  plantId: 'plant-1',
  userId: 'user-1',
  spaceId: 'space-1',
  activityType,
  performedAt,
  notes: null,
  quantity: null,
  unit: null,
  createdAt: performedAt,
  updatedAt: performedAt,
});

describe('CareLogSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-13T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el sectionTitle del dict', () => {
    render(<CareLogSummary lastCareByType={{}} dict={mockDict} lang="en" />);
    expect(screen.getByText('Last care')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando lastCareByType está vacío', () => {
    render(<CareLogSummary lastCareByType={{}} dict={mockDict} lang="en" />);
    expect(screen.getByText('No care activities logged yet.')).toBeInTheDocument();
  });

  it('muestra el nombre localizado de la actividad', () => {
    const lastCareByType: LastCareByType = {
      [CareLogActivityType.WATERING]: makeEntry(CareLogActivityType.WATERING),
    };
    render(<CareLogSummary lastCareByType={lastCareByType} dict={mockDict} lang="en" />);
    expect(screen.getByText('Watering')).toBeInTheDocument();
  });

  it('no renderiza entradas para tipos ausentes en el mapa', () => {
    const lastCareByType: LastCareByType = {
      [CareLogActivityType.WATERING]: makeEntry(CareLogActivityType.WATERING),
    };
    render(<CareLogSummary lastCareByType={lastCareByType} dict={mockDict} lang="en" />);
    expect(screen.queryByText('Fertilizing')).not.toBeInTheDocument();
    expect(screen.queryByText('Pruning')).not.toBeInTheDocument();
  });

  it('muestra el tiempo relativo formateado', () => {
    const lastCareByType: LastCareByType = {
      [CareLogActivityType.WATERING]: makeEntry(
        CareLogActivityType.WATERING,
        '2024-01-10T10:00:00.000Z',
      ),
    };
    render(<CareLogSummary lastCareByType={lastCareByType} dict={mockDict} lang="en" />);
    // 3 días antes del sistema (2024-01-13)
    expect(screen.getByText(/3 days ago/i)).toBeInTheDocument();
  });

  it('no muestra estado vacío cuando hay entradas', () => {
    const lastCareByType: LastCareByType = {
      [CareLogActivityType.WATERING]: makeEntry(CareLogActivityType.WATERING),
    };
    render(<CareLogSummary lastCareByType={lastCareByType} dict={mockDict} lang="en" />);
    expect(screen.queryByText('No care activities logged yet.')).not.toBeInTheDocument();
  });
});
