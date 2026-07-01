type Props = {
  current: number;
  capacity: number;
};

export function CapacityBar({ current, capacity }: Props) {
  const pct = Math.min((current / capacity) * 100, 100);
  const over = current > capacity;
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${over ? 'bg-destructive' : pct >= 100 ? 'bg-orange-400' : 'bg-[var(--forest)]'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
