export type AuthHeadProps = {
  eyebrow?: string;
  title: string;
  sub?: string;
};

export function AuthHead({ eyebrow, title, sub }: AuthHeadProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
      {eyebrow && (
        <span
          className="eyebrow"
          style={{ color: 'var(--forest)' }}
        >
          {eyebrow}
        </span>
      )}
      <h1
        className="headline"
        style={{ fontSize: '34px', margin: 0 }}
      >
        {title}
      </h1>
      {sub && (
        <p style={{ fontSize: '14px', color: 'var(--ink-2)', margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}
