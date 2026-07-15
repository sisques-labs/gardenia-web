import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQrDownload } from './use-qr-download.hook';

const mockDownloadBase64Image = vi.fn();
vi.mock('@/shared/presentation/utils/download-base64-image.util', () => ({
  downloadBase64Image: (...args: unknown[]) => mockDownloadBase64Image(...args),
}));

const qr = { image: 'base64data' };

describe('useQrDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('downloads the QR image with a file name derived from the entity name', () => {
    const { result } = renderHook(() => useQrDownload());

    result.current.download('Monstera', qr);

    expect(mockDownloadBase64Image).toHaveBeenCalledWith('base64data', 'Monstera-qr.png');
  });

  it('does nothing when qr is undefined', () => {
    const { result } = renderHook(() => useQrDownload());

    result.current.download('Monstera', undefined);

    expect(mockDownloadBase64Image).not.toHaveBeenCalled();
  });
});
