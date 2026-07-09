import { AuthNotebook } from '@/core/auth/presentation/components/auth-notebook/auth-notebook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = { dict: AppDict['auth']['brandPanel'] };

export function AuthBrandPanel({ dict }: Props) {
  return (
    <div className="w-[560px] shrink-0 min-h-screen bg-[linear-gradient(160deg,var(--forest)_0%,oklch(0.34_0.06_150)_60%,oklch(0.30_0.05_160)_100%)] flex flex-col items-center justify-center py-12 px-10 gap-8 relative overflow-hidden">
      {/* Grain overlay */}
      <div className="paper-grain absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden="true" />

      {/* Logo */}
      <div className="flex items-center gap-2.5 z-10">
        <span className="text-[28px] font-[var(--serif)] font-semibold text-[var(--paper)] tracking-[-0.5px]">
          Gardenia
        </span>
        <span className="eyebrow text-[oklch(0.72_0.07_145)] text-xs">
          {dict.tagline}
        </span>
      </div>

      {/* Notebook illustration */}
      <div className="z-10">
        <AuthNotebook />
      </div>

      {/* Quote */}
      <blockquote className="font-[var(--serif)] italic text-xl text-[oklch(0.90_0.02_80)] text-center m-0 max-w-[360px] leading-[1.45] z-10">
        {dict.quote}
      </blockquote>

      {/* OSS stats */}
      <p className="font-[var(--mono)] text-xs text-[oklch(0.72_0.07_145)] m-0 z-10 tracking-[0.03em]">
        {dict.stats}
      </p>
    </div>
  );
}
