"use client";

import { useState } from "react";
import { usePlants } from "@/core/plants/presentation/hooks/use-plants/use-plants.hook";
import { useUpdatePlant } from "@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import { FormModal } from "@/shared/presentation/components/ui/form-modal/form-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/presentation/components/ui/select/select";

type Props = {
  spotId: string;
  dict: {
    title: string;
    selectLabel: string;
    selectPlaceholder: string;
    noPlantsAvailable: string;
    submit: string;
    submitting: string;
    cancel: string;
    error: string;
  };
  onClose: () => void;
};

export function AddPlantToSpotModal({ spotId, dict, onClose }: Props) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { data: plants = [] } = usePlants(spaceId);
  const updatePlant = useUpdatePlant();
  const [selectedPlantId, setSelectedPlantId] = useState("");

  const availablePlants = plants.filter((plant) => plant.plantingSpotId !== spotId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedPlantId) return;
    updatePlant.mutate(
      { id: selectedPlantId, plantingSpotId: spotId },
      { onSuccess: onClose },
    );
  }

  return (
    <FormModal
      title={dict.title}
      onClose={onClose}
      onSubmit={handleSubmit}
      isPending={updatePlant.isPending}
      cancelLabel={dict.cancel}
      submitLabel={dict.submit}
      submittingLabel={dict.submitting}
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm text-ink-2">{dict.selectLabel}</label>
        {availablePlants.length === 0 ? (
          <p className="text-sm text-muted-foreground">{dict.noPlantsAvailable}</p>
        ) : (
          <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
            <SelectTrigger data-testid="add-plant-select">
              <SelectValue placeholder={dict.selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {availablePlants.map((plant) => (
                <SelectItem key={plant.id} value={plant.id}>
                  {plant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {updatePlant.isError && <span className="text-destructive text-xs">{dict.error}</span>}
    </FormModal>
  );
}
