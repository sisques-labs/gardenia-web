import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SpaceCreateScreen } from './space-create.screen';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

vi.mock('@/core/spaces/presentation/hooks/use-create-space/use-create-space.hook', () => ({
  useCreateSpace: vi.fn(() => ({ mutate: vi.fn(), isPending: false, error: null })),
}));

// Mock ScreenHeader to verify it's rendered
vi.mock('@/shared/presentation/components/screen-header/screen-header', () => ({
  ScreenHeader: ({ title }: { title: string }) => (
    <div data-testid="screen-header" data-title={title} />
  ),
}));

const dict = {
  title: 'Create space',
  name: 'Space name',
  namePlaceholder: 'e.g. My project',
  submit: 'Create',
  submitting: 'Creating...',
  error: 'Could not create the space. Try again.',
  nameMin: 'At least 3 characters',
  nameMax: 'At most 50 characters',
};

describe('SpaceCreateScreen', () => {
  it('renders ScreenHeader with title "New Space"', () => {
    render(<SpaceCreateScreen dict={dict} lang="en" />);
    const header = screen.getByTestId('screen-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('data-title', 'New Space');
  });

  it('does not apply min-h-screen to root element', () => {
    const { container } = render(<SpaceCreateScreen dict={dict} lang="en" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root?.className).not.toContain('min-h-screen');
  });

  it('does not apply flex justify-center centering wrapper', () => {
    const { container } = render(<SpaceCreateScreen dict={dict} lang="en" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root?.className).not.toContain('items-center');
    expect(root?.className).not.toContain('justify-center');
  });

  it('renders the create space form', () => {
    render(<SpaceCreateScreen dict={dict} lang="en" />);
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});
