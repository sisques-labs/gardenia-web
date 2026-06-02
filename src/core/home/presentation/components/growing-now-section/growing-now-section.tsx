import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['home'];
};

export function GrowingNowSection({ dict }: Props) {
  return (
    <div className="card">
      <h2 className="text-base font-semibold mb-4">{dict.sections.growingNow.title}</h2>
      <p className="text-sm text-muted-foreground">{dict.sections.growingNow.inProgress}</p>
    </div>
  );
}
