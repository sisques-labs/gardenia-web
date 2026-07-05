'use client';

import { Suspense } from 'react';
import { HomeTopBar } from '@/core/home/presentation/components/home-top-bar/home-top-bar';
import { TodayTasksSection } from '@/core/home/presentation/components/today-tasks-section/today-tasks-section';
import { TodayTasksSkeleton } from '@/core/home/presentation/components/today-tasks-section-skeleton/today-tasks-section-skeleton';
import { GrowingNowSection } from '@/core/home/presentation/components/growing-now-section/growing-now-section';
import { GrowingNowSkeleton } from '@/core/home/presentation/components/growing-now-section-skeleton/growing-now-section-skeleton';
import { PlantingSpotsSummarySection } from '@/core/home/presentation/components/planting-spots-summary-section/planting-spots-summary-section';
import { PlantingSpotsSummarySkeleton } from '@/core/home/presentation/components/planting-spots-summary-section-skeleton/planting-spots-summary-section-skeleton';
import { HarvestPaceSection } from '@/core/home/presentation/components/harvest-pace-section/harvest-pace-section';
import { HarvestPaceSkeleton } from '@/core/home/presentation/components/harvest-pace-section-skeleton/harvest-pace-section-skeleton';
import { JournalSection } from '@/core/home/presentation/components/journal-section/journal-section';
import { JournalSkeleton } from '@/core/home/presentation/components/journal-section-skeleton/journal-section-skeleton';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['home'];
  careScheduleDict: AppDict['careSchedule'];
  plantingSpotsDict: AppDict['plantingSpots'];
};

export function HomeScreen({ dict, careScheduleDict, plantingSpotsDict }: Props) {
  return (
    <div className="flex flex-col h-full">
      <HomeTopBar dict={dict} />

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[1.3fr_1fr] gap-6 p-8">
          <Suspense fallback={<TodayTasksSkeleton />}>
            <TodayTasksSection dict={dict} careScheduleDict={careScheduleDict} />
          </Suspense>

          <Suspense fallback={<GrowingNowSkeleton />}>
            <GrowingNowSection dict={dict} />
          </Suspense>

          <Suspense fallback={<PlantingSpotsSummarySkeleton />}>
            <PlantingSpotsSummarySection dict={dict} plantingSpotsDict={plantingSpotsDict} />
          </Suspense>

          <Suspense fallback={<HarvestPaceSkeleton />}>
            <HarvestPaceSection dict={dict} />
          </Suspense>

          <Suspense fallback={<JournalSkeleton />}>
            <JournalSection dict={dict} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
