type Props = {
  label?: string;
};

export function InDevelopment({ label }: Props) {
  return (
    <div
      data-testid="in-development"
      className="paper-grain flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[var(--rule)] p-8 text-center"
    >
      <span className="eyebrow">En desarrollo</span>
      {label && <p className="text-sm text-[var(--ink-3)]">{label}</p>}
    </div>
  );
}
