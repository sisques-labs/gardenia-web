import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { PlantQr } from '@/core/plants/domain/interfaces/plant.interface';
import { useQrDownload } from './use-qr-download.hook';

const mockDownloadBase64Image = vi.fn();
vi.mock('@/shared/presentation/utils/download-base64-image.util', () => ({
  downloadBase64Image: (...args: unknown[]) => mockDownloadBase64Image(...args),
}));

const qr: PlantQr = {
  id: 'qr1',
  spaceId: 's1',
  targetUrl: 'https://example.com',
  generation: 1,
  image: 'base64data',
  createdAt: '',
  updatedAt: '',
};

describe('useQrDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('downloads the QR image with a file name derived from the plant name', () => {
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
