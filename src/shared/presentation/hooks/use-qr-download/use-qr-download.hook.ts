import { downloadBase64Image } from "@/shared/presentation/utils/download-base64-image.util";

interface DownloadableQr {
  image: string;
}

export function useQrDownload() {
  function download(entityName: string, qr: DownloadableQr | undefined) {
    if (!qr) return;
    downloadBase64Image(qr.image, `${entityName}-qr.png`);
  }

  return { download };
}
