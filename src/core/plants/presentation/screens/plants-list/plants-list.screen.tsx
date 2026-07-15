"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CreatePlantModal } from "@/core/plants/presentation/components/create-plant-modal/create-plant-modal";
import { PlantCard } from "@/core/plants/presentation/components/plant-card/plant-card";
import { usePaginatedPlants } from "@/core/plants/presentation/hooks/use-paginated-plants/use-paginated-plants.hook";
import { usePlantFilters } from "@/core/plants/presentation/hooks/use-plant-filters/use-plant-filters.hook";
import { useDeletePlantConfirm } from "@/core/plants/presentation/hooks/use-delete-plant-confirm/use-delete-plant-confirm.hook";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import { ScreenHeader } from "@/shared/presentation/components/screen-header/screen-header";
import { Alert } from "@/shared/presentation/components/ui/alert/alert";
import { Button } from "@/shared/presentation/components/ui/button/button";
import { buttonVariants } from "@/shared/presentation/components/ui/button/button-variants";
import { ConfirmDialog } from "@/shared/presentation/components/ui/confirm-dialog/confirm-dialog";
import { cn } from "@/shared/lib/utils";
import { FilterBar, type FilterDescriptor } from "@/shared/presentation/components/ui/filter-bar/filter-bar";
import type { ActiveFilter } from "@/shared/presentation/components/ui/active-filter-chips/active-filter-chips";
import { PlantsListSkeleton } from "@/core/plants/presentation/components/plants-list-skeleton/plants-list-skeleton";
import { Pagination } from "@/shared/presentation/components/ui/pagination/pagination";
import { useUrlPage } from "@/shared/presentation/hooks/use-url-page/use-url-page.hook";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/presentation/components/ui/tabs/tabs";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";

type Props = {
  dict: AppDict["plants"];
  lang: string;
  spaceId: string | null;
  identifyLabel: string;
};

export function PlantsListScreen({ dict, lang, spaceId: spaceIdProp, identifyLabel }: Props) {
  const storeSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const spaceId = spaceIdProp ?? storeSpaceId;
  const { page, onPageChange } = useUrlPage();
  const { search, setSearch, filters } = usePlantFilters();
  const { data, isLoading, speciesCount } = usePaginatedPlants(spaceId, { page, filters });

  const onPageChangeRef = useRef(onPageChange);
  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  });

  const isFirstFiltersRender = useRef(true);
  useEffect(() => {
    if (isFirstFiltersRender.current) {
      isFirstFiltersRender.current = false;
      return;
    }
    // Reads onPageChange via a ref (not as a dependency) because its
    // identity changes on every page navigation (useUrlPage derives it from
    // searchParams) — depending on it directly would re-fire this effect
    // right after the user navigates to another page, bouncing them back to
    // page 1. This should only reset the page when `filters` itself changes.
    onPageChangeRef.current(1);
  }, [filters]);
  const { plantToDelete, requestDelete, confirmDelete, cancelDelete, isError } = useDeletePlantConfirm(spaceId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const plants = data?.items ?? [];
  const plantCount = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? page;

  return (
    <div>
      <ScreenHeader
        eyebrow={`${dict.nav} · ${plantCount} ${dict.list.statsPlants} · ${speciesCount} ${dict.list.statsSpecies}`}
        title={dict.list.title}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/${lang}/plants/identify`}
              data-testid="btn-identify-plant"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
            >
              {identifyLabel}
            </Link>
            <Button
              size="sm"
              className="ml-1 bg-forest hover:bg-forest-2 text-white gap-1"
              onClick={() => setIsCreateOpen(true)}
            >
              {dict.list.newPlant}
            </Button>
          </div>
        }
      />

      <div className="px-6 pt-4">
        <FilterBar
          filters={[
            {
              type: "search",
              key: "search",
              placeholder: dict.list.searchPlaceholder,
              value: search,
              onChange: setSearch,
            },
          ] satisfies FilterDescriptor[]}
          chips={
            search.trim()
              ? ([{ key: "search", label: `${dict.list.searchChipLabel}: ${search.trim()}` }] satisfies ActiveFilter[])
              : []
          }
          onRemoveChip={() => setSearch("")}
        />
      </div>

      {/* Filter tabs */}
      <Tabs defaultValue="all" className="px-6 border-b border-rule">
        <div className="flex items-center">
          <TabsList
            variant="line"
            className="flex-1 overflow-x-auto justify-start rounded-none h-auto border-0 pb-0 gap-0"
          >
            <TabsTrigger value="all" className="whitespace-nowrap py-3 px-4">
              {dict.list.filterAll}
              <span className="ml-1.5 text-xs font-normal opacity-60">
                {plantCount}
              </span>
            </TabsTrigger>
            {Object.entries(dict.list.categories).map(([key, label]) => (
              <TabsTrigger
                key={key}
                value={key}
                disabled
                className="whitespace-nowrap py-3 px-4"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            size="sm"
            type="submit"
            disabled
            className="shrink-0 px-4 py-3 text-sm font-medium text-ink-3 whitespace-nowrap cursor-not-allowed"
          >
            {dict.list.filters}
          </Button>
        </div>

        {/* Content */}
        <TabsContent value="all" className="pt-6 pb-6">
          {isError && (
            <Alert variant="error" message={dict.delete.error} className="mb-4" />
          )}
          {isLoading ? (
            <PlantsListSkeleton />
          ) : plants.length === 0 ? (
            <Alert variant="info" message={dict.list.empty} />
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
                {plants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    lang={lang}
                    noSpecies={dict.detail.noSpecies}
                    cardDict={dict.list.card}
                    onDelete={requestDelete}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {isCreateOpen && (
        <CreatePlantModal
          spaceId={spaceId}
          dict={dict.create}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!plantToDelete}
        onOpenChange={(open) => { if (!open) cancelDelete(); }}
        title={dict.delete.confirmTitle}
        description={dict.delete.confirmDescription}
        confirmLabel={dict.delete.confirm}
        cancelLabel={dict.delete.cancel}
        destructive
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
