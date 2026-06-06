import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Mayo 2026" />);
    expect(screen.getByRole('heading', { name: 'Mayo 2026' })).toBeInTheDocument();
  });

  it('renders eyebrow when provided', () => {
    render(<PageHeader title="Test" eyebrow="CALENDARIO · VISTA MENSUAL" />);
    expect(screen.getByText('CALENDARIO · VISTA MENSUAL')).toBeInTheDocument();
  });

  it('does not render eyebrow when omitted', () => {
    render(<PageHeader title="Test" />);
    expect(screen.queryByText(/VISTA/)).not.toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Test" subtitle="· primavera" />);
    expect(screen.getByText('· primavera')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<PageHeader title="Test" actions={<button>+ Tarea</button>} />);
    expect(screen.getByRole('button', { name: '+ Tarea' })).toBeInTheDocument();
  });
});
