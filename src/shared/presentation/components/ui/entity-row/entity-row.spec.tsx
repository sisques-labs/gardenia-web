import { render, screen, fireEvent } from '@testing-library/react';
import { EntityRow, EntityRowAction } from './entity-row';

describe('EntityRow', () => {
  it('renders children content and actions', () => {
    render(
      <EntityRow actions={<span>actions-slot</span>}>
        <span>content-slot</span>
      </EntityRow>,
    );
    expect(screen.getByText('content-slot')).toBeInTheDocument();
    expect(screen.getByText('actions-slot')).toBeInTheDocument();
  });

  it('merges className', () => {
    const { container } = render(
      <EntityRow actions={null} className="custom-class">
        <span />
      </EntityRow>,
    );
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('rounded-lg', 'border');
  });
});

describe('EntityRowAction', () => {
  it('renders a labeled button and fires onClick', () => {
    const onClick = vi.fn();
    render(<EntityRowAction label="Edit" onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies destructive styling for the destructive variant', () => {
    render(<EntityRowAction label="Delete" onClick={() => {}} variant="destructive" />);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('text-destructive');
  });

  it('applies accent styling for the accent variant', () => {
    render(<EntityRowAction label="Complete" onClick={() => {}} variant="accent" />);
    expect(screen.getByRole('button', { name: 'Complete' })).toHaveClass('text-[var(--forest)]');
  });
});
