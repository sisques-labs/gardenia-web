import { describe, it, expect } from 'vitest';
import { getPlantingSpotPositionLabel } from './get-planting-spot-position-label.util';

describe('getPlantingSpotPositionLabel', () => {
  it('returns row and column when both are set', () => {
    expect(getPlantingSpotPositionLabel({ row: 2, column: 3 })).toBe('F2 · C3');
  });

  it('returns only the row when column is missing', () => {
    expect(getPlantingSpotPositionLabel({ row: 2, column: null })).toBe('F2');
  });

  it('returns only the column when row is missing', () => {
    expect(getPlantingSpotPositionLabel({ row: null, column: 3 })).toBe('C3');
  });

  it('returns null when neither is set', () => {
    expect(getPlantingSpotPositionLabel({ row: null, column: null })).toBeNull();
  });

  it('treats undefined the same as null', () => {
    expect(getPlantingSpotPositionLabel({})).toBeNull();
  });
});
