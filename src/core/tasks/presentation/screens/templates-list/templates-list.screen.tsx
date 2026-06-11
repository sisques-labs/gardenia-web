'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { useTaskTemplates } from '@/core/tasks/presentation/hooks/use-task-templates/use-task-templates.hook';
import { useDeleteTaskTemplate } from '@/core/tasks/presentation/hooks/use-delete-task-template/use-delete-task-template.hook';
import { PageHeader } from '@/shared/presentation/components/page-header/page-header';
import { DataTable } from '@/shared/presentation/components/ui/table';
import { Pagination } from '@/shared/presentation/components/ui/pagination/pagination';
import { Alert } from '@/shared/presentation/components/ui/alert';
import { Button } from '@/shared/presentation/components/ui/button';
import { ConfirmModal } from '@/shared/presentation/components/ui/dialog';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';

const PAGE_SIZE = 10;

type Props = {
  dict: AppDict['tasks'];
  lang: string;
  spaceId?: string | null;
};

export function TemplatesListScreen({ dict, lang }: Props) {
  const [page, setPage] = useState(1);
  const [templateToDelete, setTemplateToDelete] = useState<ITaskTemplate | null>(null);

  const { data, isLoading } = useTaskTemplates({ page, pageSize: PAGE_SIZE });
  const { mutate: deleteTemplate } = useDeleteTaskTemplate();

  const t = dict.templates;

  const columns: ColumnDef<ITaskTemplate>[] = [
    {
      accessorKey: 'name',
      header: t.columns.name,
      cell: ({ row }) => (
        <Link
          href={`/${lang}/settings/templates/${row.original.id}`}
          className="hover:underline font-medium"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'defaultRetryCount',
      header: t.columns.maxRetries,
    },
    {
      accessorKey: 'defaultBackoffStrategy',
      header: t.columns.backoffStrategy,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Link
            href={`/${lang}/settings/templates/${row.original.id}`}
            className="text-sm hover:underline px-2 py-1"
          >
            Edit
          </Link>
          <Button
            variant="ghost"
            size="sm"
            data-testid={`delete-template-btn-${row.original.id}`}
            onClick={() => setTemplateToDelete(row.original)}
          >
            {t.deleteBtn}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.listTitle}
        actions={
          <Link
            href={`/${lang}/settings/templates/new`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {t.newTemplate}
          </Link>
        }
      />

      {isLoading ? (
        <div className="px-6 pt-4">
          <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
        </div>
      ) : !data?.items.length ? (
        <div className="px-6 pt-4">
          <Alert variant="info" message={t.empty} />
        </div>
      ) : (
        <div className="px-6 pt-4 flex flex-col gap-4">
          <DataTable columns={columns} data={data.items} enableRowSelection={false} />
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmModal
        open={!!templateToDelete}
        onOpenChange={(open) => { if (!open) setTemplateToDelete(null); }}
        title={t.deleteConfirmTitle}
        description={t.deleteConfirmDescription}
        onConfirm={() => {
          if (!templateToDelete) return;
          deleteTemplate(templateToDelete.id, {
            onSuccess: () => setTemplateToDelete(null),
          });
        }}
        onCancel={() => setTemplateToDelete(null)}
        confirmLabel={t.deleteConfirmLabel}
        cancelLabel={t.keepLabel}
        destructive
      />
    </div>
  );
}
