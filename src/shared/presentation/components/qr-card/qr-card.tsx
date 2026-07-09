import { Button } from "@/shared/presentation/components/ui/button/button";
import { Download } from "lucide-react";
import Image from "next/image";

interface QrCardProps {
  image: string;
  code: string;
  label: string;
  hint: string;
  downloadLabel: string;
  onDownload: () => void;
}

export function QrCard({ image, code, label, hint, downloadLabel, onDownload }: QrCardProps) {
  return (
    <div
      data-testid="qr-card"
      className="relative w-full lg:w-52 -rotate-2 hover:rotate-0 transition-transform duration-300 rounded-2xl border-2 border-dashed border-[var(--rule)] bg-[var(--paper-2)] px-5 py-6 flex flex-col items-center gap-3 shadow-sm"
    >
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full border border-[var(--rule)] bg-[var(--paper)]"
      />
      <p className="eyebrow text-center">{label}</p>
      <Image
        data-testid="qr-image"
        src={`data:image/png;base64,${image}`}
        alt="QR"
        width={96}
        height={96}
        unoptimized
        className="w-24 h-24 rounded-md ring-1 ring-[var(--rule)] bg-[var(--white)] p-1.5"
      />
      <p data-testid="qr-code" className="text-xs text-center text-muted-foreground font-mono">
        {code}
      </p>
      <p className="text-xs text-center text-muted-foreground">{hint}</p>
      <Button
        variant="ghost"
        size="sm"
        data-testid="qr-download-btn"
        className="text-xs text-[var(--forest)] w-full"
        onClick={onDownload}
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        {downloadLabel}
      </Button>
    </div>
  );
}
