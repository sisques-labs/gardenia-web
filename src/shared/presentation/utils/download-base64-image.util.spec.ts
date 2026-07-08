import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBase64Image } from './download-base64-image.util';

describe('downloadBase64Image', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('builds a PNG blob from the base64 data and triggers a download with the given file name', () => {
    const clickSpy = vi.fn();
    const anchor = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement;
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    downloadBase64Image('aGVsbG8=', 'plant-qr.png');

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    const blobArg = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe('image/png');
    expect(anchor.download).toBe('plant-qr.png');
    expect(anchor.href).toBe('blob:mock-url');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    createElementSpy.mockRestore();
  });
});
