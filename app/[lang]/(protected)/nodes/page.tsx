import { Suspense } from 'react';
import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { NodesScreen } from '@/core/nodes/presentation/screens/nodes/nodes.screen';
import { NodesListSkeleton } from '@/core/nodes/presentation/components/nodes-list-skeleton/nodes-list-skeleton';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <Suspense fallback={<NodesListSkeleton />}>
      <NodesScreen dict={dict.nodes} />
    </Suspense>
  );
}
