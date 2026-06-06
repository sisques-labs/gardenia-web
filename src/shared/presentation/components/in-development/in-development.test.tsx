import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InDevelopment } from './in-development';

describe('InDevelopment', () => {
  it('renders without crashing when no props provided', () => {
    const { container } = render(<InDevelopment />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the label when provided', () => {
    render(<InDevelopment label="Tareas del día" />);
    expect(screen.getByText('Tareas del día')).toBeInTheDocument();
  });

  it('renders fallback content without label', () => {
    render(<InDevelopment />);
    expect(screen.getByTestId('in-development')).toBeInTheDocument();
  });
});
