import type { PlantQr } from '@/core/plants/domain/interfaces/plant.interface';
import { downloadBase64Image } from '@/shared/presentation/utils/download-base64-image.util';

export function useQrDownload() {
  function download(plantName: string, qr: PlantQr | undefined) {
    if (!qr) return;
    downloadBase64Image(qr.image, `${plantName}-qr.png`);
  }

  return { download };
}
