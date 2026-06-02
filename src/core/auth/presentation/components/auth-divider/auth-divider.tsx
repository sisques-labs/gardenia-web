export type AuthDividerProps = {
  label: string;
};

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: 'var(--ink-3)',
        fontSize: '12px',
      }}
    >
      <div style={{ flex: 1, height: 1, background: 'oklch(0.84 0.03 70)' }} />
      <span>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'oklch(0.84 0.03 70)' }} />
    </div>
  );
}
