"use client";

import { usePlantingSpots } from "@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook";
import { useUpdatePlant } from "@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook";
import { Alert } from "@/shared/presentation/components/ui/alert/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/presentation/components/ui/select/select";

const UNASSIGNED_VALUE = "__unassigned__";

type Props = {
  plantId: string;
  currentSpotId?: string;
  dict: {
    label: string;
    unassigned: string;
    placeholder: string;
    updateError: string;
  };
};

export function PlantPlantingSpotField({ plantId, currentSpotId, dict }: Props) {
  const { spots } = usePlantingSpots(1, 100);
  const updatePlant = useUpdatePlant();

  function handleChange(value: string) {
    updatePlant.mutate({
      id: plantId,
      plantingSpotId: value === UNASSIGNED_VALUE ? null : value,
    });
  }

  return (
    <div className="flex flex-col gap-1" data-testid="plant-planting-spot-field">
      <span className="text-xs font-medium text-muted-foreground">{dict.label}</span>
      <Select value={currentSpotId ?? UNASSIGNED_VALUE} onValueChange={handleChange}>
        <SelectTrigger className="w-full sm:w-64" data-testid="plant-planting-spot-select">
          <SelectValue placeholder={dict.placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNASSIGNED_VALUE}>{dict.unassigned}</SelectItem>
          {spots.map((spot) => (
            <SelectItem key={spot.id} value={spot.id}>
              {spot.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {updatePlant.isError && <Alert variant="error" message={dict.updateError} />}
    </div>
  );
}
