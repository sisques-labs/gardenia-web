'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { useTasks } from '@/core/tasks/presentation/hooks/use-tasks/use-tasks.hook';
import { TaskStatusBadge } from '@/core/tasks/presentation/components/task-status-badge/task-status-badge';
import { ScheduleTaskModal } from '@/core/tasks/presentation/components/schedule-task-modal/schedule-task-modal';
import { PageHeader } from '@/shared/presentation/components/page-header/page-header';
import { DataTable } from '@/shared/presentation/components/ui/table';
import { Pagination } from '@/shared/presentation/components/ui/pagination/pagination';
import { Alert } from '@/shared/presentation/components/ui/alert';
import { Button } from '@/shared/presentation/components/ui/button';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';

const PAGE_SIZE = 10;

type Props = {
  dict: AppDict['tasks'];
  lang: string;
  spaceId?: string | null;
};

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function TasksListScreen({ dict, lang }: Props) {
  const [page, setPage] = useState(1);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const { data, isLoading } = useTasks({ page, pageSize: PAGE_SIZE });

  const columns: ColumnDef<ITask>[] = [
    {
      accessorKey: 'title',
      header: dict.list.columns.name,
      cell: ({ row }) => (
        <Link href={`/${lang}/tasks/${row.original.id}`} className="hover:underline font-medium">
          {row.original.title ?? row.original.id}
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      header: dict.list.columns.status,
      cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'scheduledAt',
      header: dict.list.columns.scheduledAt,
      cell: ({ row }) =>
        row.original.scheduledAt
          ? new Date(row.original.scheduledAt).toLocaleString()
          : '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title={dict.list.title}
        actions={
          <Button onClick={() => setScheduleOpen(true)}>
            {dict.schedule.title}
          </Button>
        }
      />
      <ScheduleTaskModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />

      {isLoading ? (
        <div className="px-6 pt-4">
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : !data?.items.length ? (
        <div className="px-6 pt-4">
          <Alert variant="info" message={dict.list.empty} />
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
    </div>
  );
}
