import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthSubmit } from './auth-submit';

describe('AuthSubmit', () => {
  it('renders with label', () => {
    render(<AuthSubmit label="Submit" loadingLabel="Submitting..." isPending={false} />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDefined();
  });

  it('is disabled and shows loading label when isPending=true', () => {
    render(<AuthSubmit label="Submit" loadingLabel="Submitting..." isPending={true} />);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toContain('Submitting...');
  });

  it('is not disabled when isPending=false', () => {
    render(<AuthSubmit label="Submit" loadingLabel="Submitting..." isPending={false} />);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });
});
