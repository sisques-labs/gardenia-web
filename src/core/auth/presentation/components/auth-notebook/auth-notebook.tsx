export function AuthNotebook() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 260"
      width="160"
      height="200"
      style={{ transform: 'rotate(-4deg)', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Notebook cover */}
      <rect
        x="20"
        y="10"
        width="160"
        height="240"
        rx="8"
        fill="var(--paper)"
        stroke="oklch(0.84 0.03 70)"
        strokeWidth="2"
      />
      {/* Spine */}
      <rect x="20" y="10" width="20" height="240" rx="4" fill="oklch(0.88 0.028 80)" />
      {/* Ruled lines */}
      {[60, 80, 100, 120, 140, 160, 180, 200].map((y) => (
        <line
          key={y}
          x1="55"
          y1={y}
          x2="165"
          y2={y}
          stroke="oklch(0.84 0.03 70)"
          strokeWidth="1"
        />
      ))}
      {/* Tomato plant illustration */}
      <circle cx="110" cy="45" r="12" fill="var(--terracotta)" opacity="0.8" />
      <line x1="110" y1="57" x2="110" y2="75" stroke="var(--forest-2)" strokeWidth="2" />
      <path d="M110 65 Q95 58 92 48" stroke="var(--forest-2)" strokeWidth="1.5" fill="none" />
      <path d="M110 65 Q125 58 128 48" stroke="var(--forest-2)" strokeWidth="1.5" fill="none" />
      {/* Title line */}
      <rect x="55" y="38" width="40" height="6" rx="2" fill="oklch(0.78 0.03 70)" opacity="0.5" />
    </svg>
  );
}
