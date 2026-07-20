import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhotoOrganPicker, type PhotoOrganPickerPhoto } from './photo-organ-picker';

const dict = {
  addPhoto: 'Add photo',
  removePhoto: 'Remove photo',
  photosHint: 'Add 1 to 5 JPG or PNG photos, then choose which part of the plant each one shows.',
  maxPhotosReached: 'You can add up to 5 photos',
  unsupportedFormat: 'Only JPG and PNG photos are supported — some files were skipped.',
  organLabel: 'Plant part',
  organ: {
    leaf: 'Leaf',
    flower: 'Flower',
    fruit: 'Fruit',
    bark: 'Bark',
    habit: 'Whole plant',
    other: 'Other',
  },
};

function makePhoto(id: string, organ: PhotoOrganPickerPhoto['organ'] = 'leaf'): PhotoOrganPickerPhoto {
  return {
    id,
    file: new File(['x'], `${id}.png`, { type: 'image/png' }),
    previewUrl: `blob:${id}`,
    organ,
  };
}

describe('PhotoOrganPicker', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  it('renders the add-photo button', () => {
    render(<PhotoOrganPicker photos={[]} onChange={vi.fn()} dict={dict} />);

    expect(screen.getByTestId('btn-add-photo')).toBeInTheDocument();
  });

  it('renders no items when there are no photos', () => {
    render(<PhotoOrganPicker photos={[]} onChange={vi.fn()} dict={dict} />);

    expect(screen.queryByTestId(/photo-organ-picker-item-/)).not.toBeInTheDocument();
  });

  it('renders an item per photo with its thumbnail and organ select', () => {
    const photos = [makePhoto('p1'), makePhoto('p2', 'flower')];
    render(<PhotoOrganPicker photos={photos} onChange={vi.fn()} dict={dict} />);

    expect(screen.getByTestId('photo-organ-picker-item-p1')).toBeInTheDocument();
    expect(screen.getByTestId('photo-organ-picker-item-p2')).toBeInTheDocument();
    expect(screen.getByTestId('select-organ-p2')).toHaveTextContent('Flower');
  });

  it('calls onChange with a new photo entry when a file is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PhotoOrganPicker photos={[]} onChange={onChange} dict={dict} />);

    const file = new File(['x'], 'leaf.png', { type: 'image/png' });
    const input = screen.getByTestId('photo-organ-picker-input') as HTMLInputElement;
    await user.upload(input, file);

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ file, organ: 'leaf', previewUrl: 'blob:mock-url' }),
    ]);
  });

  it('calls onChange without the removed photo when its remove button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const photos = [makePhoto('p1'), makePhoto('p2')];
    render(<PhotoOrganPicker photos={photos} onChange={onChange} dict={dict} />);

    await user.click(screen.getByTestId('btn-remove-photo-p1'));

    expect(onChange).toHaveBeenCalledWith([photos[1]]);
  });

  it('calls onChange with the updated organ when a different organ is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const photos = [makePhoto('p1', 'leaf')];
    render(<PhotoOrganPicker photos={photos} onChange={onChange} dict={dict} />);

    await user.click(screen.getByTestId('select-organ-p1'));
    await user.click(screen.getByRole('option', { name: 'Flower' }));

    expect(onChange).toHaveBeenCalledWith([{ ...photos[0], organ: 'flower' }]);
  });

  it('disables the add-photo button and shows a message once maxPhotos is reached', () => {
    const photos = Array.from({ length: 5 }, (_, i) => makePhoto(`p${i}`));
    render(<PhotoOrganPicker photos={photos} onChange={vi.fn()} dict={dict} maxPhotos={5} />);

    expect(screen.getByTestId('btn-add-photo')).toBeDisabled();
    expect(screen.getByTestId('max-photos-reached')).toBeInTheDocument();
  });

  it('only adds photos up to the remaining slots when exceeding maxPhotos', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const photos = Array.from({ length: 4 }, (_, i) => makePhoto(`p${i}`));
    render(<PhotoOrganPicker photos={photos} onChange={onChange} dict={dict} maxPhotos={5} />);

    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const input = screen.getByTestId('photo-organ-picker-input') as HTMLInputElement;
    await user.upload(input, [fileA, fileB]);

    const lastCallArg = onChange.mock.calls.at(-1)?.[0] as PhotoOrganPickerPhoto[];
    expect(lastCallArg).toHaveLength(5);
  });

  // The OS file picker already filters by the input's `accept` attribute, so
  // `userEvent.upload` (which emulates that) can't exercise a mismatched
  // file reaching the handler. `fireEvent.change` bypasses that emulation to
  // cover the defense-in-depth JS check for clients that don't honor `accept`
  // (drag-and-drop, non-compliant browsers).
  it('accepts image/jpeg and image/png but skips other formats, e.g. webp', () => {
    const onChange = vi.fn();
    render(<PhotoOrganPicker photos={[]} onChange={onChange} dict={dict} />);

    const jpeg = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
    const webp = new File(['b'], 'b.webp', { type: 'image/webp' });
    const input = screen.getByTestId('photo-organ-picker-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [jpeg, webp] } });

    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ file: jpeg })]);
  });

  it('shows a hint and adds nothing when every selected file has an unsupported format', () => {
    const onChange = vi.fn();
    render(<PhotoOrganPicker photos={[]} onChange={onChange} dict={dict} />);

    const webp = new File(['x'], 'x.webp', { type: 'image/webp' });
    const input = screen.getByTestId('photo-organ-picker-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [webp] } });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('unsupported-format')).toBeInTheDocument();
  });

  it('does not show the unsupported-format hint when every file is accepted', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PhotoOrganPicker photos={[]} onChange={onChange} dict={dict} />);

    const file = new File(['x'], 'x.png', { type: 'image/png' });
    const input = screen.getByTestId('photo-organ-picker-input') as HTMLInputElement;
    await user.upload(input, file);

    expect(screen.queryByTestId('unsupported-format')).not.toBeInTheDocument();
  });
});
