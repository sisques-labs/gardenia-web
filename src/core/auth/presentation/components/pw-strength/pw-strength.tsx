import { getPwStrength } from '@/core/auth/presentation/helpers/get-pw-strength';

const SEGMENT_COLORS: Record<number, string> = {
  1: 'var(--terracotta)',
  2: 'var(--honey-2)',
  3: 'var(--forest-2)',
  4: 'var(--forest)',
};

const STRENGTH_LABELS: Record<number, string> = {
  1: 'muy débil',
  2: 'débil',
  3: 'buena',
  4: 'fuerte',
};

export type PwStrengthProps = {
  password: string;
};

export function PwStrength({ password }: PwStrengthProps) {
  const strength = getPwStrength(password);

  const label = strength > 0 ? STRENGTH_LABELS[strength] : undefined;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {Array.from({ length: 4 }, (_, i) => {
          const segmentLevel = i + 1;
          const isFilled = strength >= segmentLevel;
          return isFilled ? (
            <div
              key={i}
              data-testid="pw-segment-filled"
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: SEGMENT_COLORS[segmentLevel] ?? 'var(--forest)',
              }}
            />
          ) : (
            <div
              key={i}
              data-testid="pw-segment-empty"
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'oklch(0.84 0.03 70)',
              }}
            />
          );
        })}
      </div>
      {label && (
        <span
          data-testid="pw-strength-label"
          style={{ fontFamily: 'var(--hand)', fontSize: 14, color: SEGMENT_COLORS[strength] }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
