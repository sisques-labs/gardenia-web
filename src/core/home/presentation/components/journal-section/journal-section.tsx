import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['home'];
};

export function JournalSection({ dict }: Props) {
  return (
    <div className="card">
      <h2 className="text-base font-semibold mb-4">{dict.sections.journal.title}</h2>
      <p className="text-sm text-muted-foreground">{dict.sections.journal.inProgress}</p>
    </div>
  );
}
