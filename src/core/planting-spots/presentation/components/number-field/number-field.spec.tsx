import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NumberField } from './number-field';

describe('NumberField', () => {
  it('associates the label with the input', () => {
    render(<NumberField label="Rows" value={null} onChange={vi.fn()} min={1} />);
    expect(screen.getByLabelText('Rows')).toBeInTheDocument();
  });

  it('renders the error message when provided', () => {
    render(<NumberField label="Rows" value={null} onChange={vi.fn()} min={1} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
