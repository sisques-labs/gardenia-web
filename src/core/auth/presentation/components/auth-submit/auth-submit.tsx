export type AuthSubmitProps = {
  label: string;
  loadingLabel: string;
  isPending: boolean;
};

export function AuthSubmit({ label, loadingLabel, isPending }: AuthSubmitProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      style={{
        width: '100%',
        padding: '14px',
        background: 'var(--forest)',
        color: 'var(--paper)',
        borderRadius: '999px',
        fontSize: '14.5px',
        fontWeight: 600,
        border: 'none',
        cursor: isPending ? 'not-allowed' : 'pointer',
        boxShadow: '0 6px 18px -6px oklch(0.42 0.07 145 / 0.6)',
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? loadingLabel : label}
    </button>
  );
}
