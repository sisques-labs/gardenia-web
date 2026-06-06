type Stage = {
  name: string;
  daysStart: number;
  daysEnd: number;
  color: string;
};

type GrowthTimelineProps = {
  stages: Stage[];
  currentDay: number;
  totalDays: number;
  startDate?: string;
  estimatedEndDate?: string;
};

export function GrowthTimeline({
  stages,
  currentDay,
  totalDays,
  startDate,
  estimatedEndDate,
}: GrowthTimelineProps) {
  const safeTotalDays = totalDays === 0 ? 1 : totalDays;

  return (
    <div data-testid="growth-timeline" className="flex flex-col gap-2">
      <div className="relative flex rounded-md overflow-hidden h-10">
        {stages.map((stage) => (
          <div
            key={stage.name}
            data-testid={`stage-${stage.name.toLowerCase()}`}
            style={{
              width: `${((stage.daysEnd - stage.daysStart) / safeTotalDays) * 100}%`,
              backgroundColor: stage.color,
            }}
            className="flex items-center justify-center text-xs font-medium text-white"
          >
            {stage.name}
          </div>
        ))}
        {/* Current day marker */}
        <div
          data-testid="current-day-marker"
          className="absolute top-0 bottom-0 w-0.5 bg-white"
          style={{ left: `${(currentDay / safeTotalDays) * 100}%` }}
        />
      </div>
      {(startDate || estimatedEndDate) && (
        <div className="flex justify-between text-xs text-[var(--ink-3)]">
          {startDate && <span data-testid="start-date">{startDate}</span>}
          {estimatedEndDate && <span data-testid="end-date">{estimatedEndDate}</span>}
        </div>
      )}
    </div>
  );
}
