import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ScreenHeader } from './screen-header';

// Mock next/link used inside breadcrumbs
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ScreenHeader', () => {
  it('renders the title as a heading', () => {
    render(<ScreenHeader title="Spaces" />);
    expect(screen.getByRole('heading', { name: 'Spaces' })).toBeInTheDocument();
  });

  it('renders title with headline/serif class', () => {
    render(<ScreenHeader title="Spaces" />);
    const heading = screen.getByRole('heading', { name: 'Spaces' });
    expect(heading).toHaveClass('headline');
  });

  it('renders breadcrumbs when provided', () => {
    render(
      <ScreenHeader
        title="Spaces"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Spaces' }]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Spaces', { selector: 'span' })).toBeInTheDocument();
  });

  it('renders linked breadcrumb with href', () => {
    render(
      <ScreenHeader
        title="Test"
        breadcrumbs={[{ label: 'Home', href: '/' }]}
      />,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders last breadcrumb as plain text (no link)', () => {
    render(
      <ScreenHeader
        title="Test"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Spaces' }]}
      />,
    );
    // 'Spaces' should appear as a span, not a link
    const breadcrumbSpan = screen.getByText('Spaces', { selector: 'span' });
    expect(breadcrumbSpan).toBeInTheDocument();
  });

  it('does not render breadcrumbs when not provided', () => {
    render(<ScreenHeader title="Spaces" />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(<ScreenHeader title="Spaces" actions={<button>New Space</button>} />);
    expect(screen.getByRole('button', { name: 'New Space' })).toBeInTheDocument();
  });

  it('renders actions right-aligned via ml-auto', () => {
    render(<ScreenHeader title="Spaces" actions={<button>New</button>} />);
    const actionsContainer = screen.getByTestId('screen-header-actions');
    expect(actionsContainer).toHaveClass('ml-auto');
  });

  it('does not render actions area when not provided', () => {
    render(<ScreenHeader title="Spaces" />);
    expect(screen.queryByTestId('screen-header-actions')).not.toBeInTheDocument();
  });
});
