'use client';

import { useRouter } from 'next/navigation';
import { TemplateForm } from './template-form';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

interface Props {
  dict: AppDict['tasks'];
  lang: string;
}

export function TemplateFormScreen({ dict, lang }: Props) {
  const router = useRouter();

  return (
    <div className="px-6 pt-4 max-w-lg">
      <h1 className="text-xl font-semibold mb-6">{dict.templates.formTitle}</h1>
      <TemplateForm
        dict={dict}
        onSuccess={() => router.push(`/${lang}/settings/templates`)}
      />
    </div>
  );
}
