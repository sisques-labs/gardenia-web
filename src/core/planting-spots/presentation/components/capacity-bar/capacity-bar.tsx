type Props = {
  current: number;
  capacity: number;
  size?: 'sm' | 'md';
};

export function CapacityBar({ current, capacity, size = 'md' }: Props) {
  const pct = Math.min((current / capacity) * 100, 100);
  const over = current > capacity;
  return (
    <div className={`w-full rounded-full bg-muted overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
      <div
        className={`h-full rounded-full transition-all ${over ? 'bg-destructive' : pct >= 100 ? 'bg-orange-400' : 'bg-[var(--forest)]'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
