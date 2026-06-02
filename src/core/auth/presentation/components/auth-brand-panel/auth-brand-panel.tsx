import { AuthNotebook } from '@/core/auth/presentation/components/auth-notebook/auth-notebook';

export function AuthBrandPanel() {
  return (
    <div
      style={{
        width: '560px',
        flexShrink: 0,
        minHeight: '100vh',
        background:
          'linear-gradient(160deg, var(--forest) 0%, oklch(0.34 0.06 150) 60%, oklch(0.30 0.05 160) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        gap: 32,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grain overlay */}
      <div
        className="paper-grain"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
        <span
          style={{
            fontSize: '28px',
            fontFamily: 'var(--serif)',
            fontWeight: 600,
            color: 'var(--paper)',
            letterSpacing: '-0.5px',
          }}
        >
          Gardenia
        </span>
        <span
          className="eyebrow"
          style={{ color: 'oklch(0.72 0.07 145)', fontSize: '10px' }}
        >
          cuaderno de huertas
        </span>
      </div>

      {/* Notebook illustration */}
      <div style={{ zIndex: 1 }}>
        <AuthNotebook />
      </div>

      {/* Quote */}
      <blockquote
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: '20px',
          color: 'oklch(0.90 0.02 80)',
          textAlign: 'center',
          margin: 0,
          maxWidth: '360px',
          lineHeight: 1.45,
          zIndex: 1,
        }}
      >
        &ldquo;Planta algo. Riégalo. Míralo crecer.&rdquo;
      </blockquote>

      {/* OSS stats */}
      <p
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'oklch(0.72 0.07 145)',
          margin: 0,
          zIndex: 1,
          letterSpacing: '0.03em',
        }}
      >
        GitHub ★ &nbsp;·&nbsp; MIT &nbsp;·&nbsp; sin anuncios
      </p>
    </div>
  );
}
