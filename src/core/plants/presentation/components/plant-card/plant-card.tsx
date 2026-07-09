import { useAuthStore } from "@/core/auth/infrastructure/store/auth.store";
import type { Plant } from "@/core/plants/domain/interfaces/plant.interface";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import { Button } from "@/shared/presentation/components/ui/button/button";
import { Chip } from "@/shared/presentation/components/ui/chip/chip";
import {
  StatusDot,
  type StatusDotStatus,
} from "@/shared/presentation/components/ui/status-dot/status-dot";
import { formatShortDate } from "@/shared/presentation/utils/format-short-date.util";
import { getAuthenticatedImageUrl } from "@/shared/presentation/utils/get-authenticated-image-url.util";
import { Calendar, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type CardDict = {
  delete: string;
  health: Record<StatusDotStatus, string>;
};

type Props = {
  plant: Plant;
  lang: string;
  noSpecies: string;
  cardDict: CardDict;
  /** Next or last care activity label for the chip badge */
  careLabel?: string;
  /** ISO date for the care activity shown in the footer */
  careDate?: string;
  /** Plant health indicator */
  status?: StatusDotStatus;
  /** Called when the user confirms deletion */
  onDelete?: (plant: Plant) => void;
};

export function PlantCard({
  plant,
  lang,
  noSpecies,
  cardDict,
  careLabel,
  careDate,
  status,
  onDelete,
}: Props) {
  const showFooter = Boolean(careDate || status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const imageSrc = getAuthenticatedImageUrl(plant.imageUrl, accessToken, currentSpaceId);

  return (
    <Link
      href={`/${lang}/plants/${plant.id}`}
      className="card overflow-hidden w-full hover:shadow-md transition-shadow block"
      data-testid="plant-card"
    >
      <div className="relative">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={plant.name}
            width={224}
            height={144}
            className="h-36 w-full object-cover"
            unoptimized
          />
        ) : (
          <div className="placeholder-img leaf h-36" aria-hidden="true" />
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            data-testid="btn-delete-plant"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-paper/80 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(plant);
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">{cardDict.delete}</span>
          </Button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="font-serif text-base font-medium truncate">
              {plant.name}
            </div>
            <div className="text-xs text-muted-foreground italic truncate">
              {plant.species?.scientificName ?? noSpecies}
            </div>
          </div>
          {careLabel && (
            <Chip variant="terra" className="shrink-0">
              {careLabel}
            </Chip>
          )}
        </div>

        {showFooter && (
          <>
            <div className="dashed-rule my-3" />
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              {careDate ? (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {formatShortDate(careDate, lang)}
                </span>
              ) : (
                <span />
              )}
              {status && (
                <span className="flex items-center gap-1">
                  <StatusDot status={status} />
                  {cardDict.health[status]}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
