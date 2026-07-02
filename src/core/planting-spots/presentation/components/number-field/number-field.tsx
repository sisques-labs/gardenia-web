import { Input } from '@/shared/presentation/components/ui/input/input';

type Props = {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  error?: string;
  min: number;
  /** Integer fields (parseInt) clamp below `min` to null; float fields (parseFloat) only reject non-numeric input, matching the original per-field behavior. */
  integer?: boolean;
  step?: number | 'any';
};

export function NumberField({ label, value, onChange, error, min, integer = true, step }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <Input
        type="number"
        min={min}
        step={step}
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') return onChange(null);
          const parsed = integer ? parseInt(raw, 10) : parseFloat(raw);
          if (isNaN(parsed)) return onChange(null);
          if (integer && parsed < min) return onChange(null);
          onChange(parsed);
        }}
      />
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}
