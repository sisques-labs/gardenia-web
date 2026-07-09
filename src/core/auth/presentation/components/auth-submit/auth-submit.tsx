import { cn } from '@/shared/lib/utils';

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
      className={cn(
        'w-full p-3.5 bg-[var(--forest)] text-[var(--paper)] rounded-full text-[14.5px] font-semibold border-0 shadow-[0_6px_18px_-6px_oklch(0.42_0.07_145_/_0.6)]',
        isPending ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100',
      )}
    >
      {isPending ? loadingLabel : label}
    </button>
  );
}
