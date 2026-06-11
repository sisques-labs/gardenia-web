'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTask } from '@/core/tasks/presentation/hooks/use-task/use-task.hook';
import { useTaskRuns } from '@/core/tasks/presentation/hooks/use-task-runs/use-task-runs.hook';
import { useCancelTask } from '@/core/tasks/presentation/hooks/use-cancel-task/use-cancel-task.hook';
import { TaskStatusBadge } from '@/core/tasks/presentation/components/task-status-badge/task-status-badge';
import { TaskRunStatusBadge } from '@/core/tasks/presentation/components/task-run-status-badge/task-run-status-badge';
import { PageHeader } from '@/shared/presentation/components/page-header/page-header';
import { Alert } from '@/shared/presentation/components/ui/alert';
import { Button } from '@/shared/presentation/components/ui/button';
import { ConfirmModal } from '@/shared/presentation/components/ui/dialog';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['tasks'];
  lang: string;
  taskId: string;
};

export function TaskDetailScreen({ dict, lang, taskId }: Props) {
  const { data: task, isLoading: taskLoading } = useTask(taskId);
  const { data: runs, isLoading: runsLoading } = useTaskRuns({ taskId, page: 1, pageSize: 20 });
  const { mutate: cancelTask } = useCancelTask();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isCancellable = task?.status === TaskStatus.Pending;

  if (taskLoading || runsLoading) {
    return (
      <div className="px-6 pt-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link href={`/${lang}/tasks`} className="hover:underline">
            {dict.detail.breadcrumbList}
          </Link>
        }
        title={task.title ?? task.id}
        actions={
          isCancellable ? (
            <Button
              variant="outline"
              data-testid="cancel-task-btn"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Task
            </Button>
          ) : undefined
        }
      />

      <div className="px-6 pt-4 flex flex-col gap-6">
        {/* Task metadata */}
        <section className="card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TaskStatusBadge status={task.status} />
          </div>
          {task.scheduledAt && (
            <p className="text-sm text-muted-foreground">
              {new Date(task.scheduledAt).toLocaleString()}
            </p>
          )}
          {Object.keys(task.payload).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                {dict.detail.payload}
              </h3>
              <pre className="text-xs bg-muted rounded p-2 overflow-auto">
                {JSON.stringify(task.payload, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* Run history */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {dict.detail.runs}
          </h2>

          {!runs?.items.length ? (
            <Alert
              variant="info"
              message={dict.detail.runsEmpty}
              data-testid="task-run-list-empty"
            />
          ) : (
            <div data-testid="task-run-list" className="flex flex-col gap-2">
              {runs.items.map((run) => (
                <div
                  key={run.id}
                  data-testid="task-run-item"
                  className="card p-3 flex items-center gap-3 text-sm"
                >
                  <TaskRunStatusBadge status={run.status} />
                  <span className="text-muted-foreground text-xs">
                    {run.startedAt ? new Date(run.startedAt).toLocaleString() : '—'}
                  </span>
                  {run.endedAt && (
                    <span className="text-muted-foreground text-xs">
                      → {new Date(run.endedAt).toLocaleString()}
                    </span>
                  )}
                  {run.error && (
                    <span className="text-terra text-xs ml-auto truncate max-w-xs">
                      {run.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {isCancellable && (
        <ConfirmModal
          open={showCancelConfirm}
          onOpenChange={setShowCancelConfirm}
          title="Cancel Task"
          description="Are you sure you want to cancel this task? This action cannot be undone."
          onConfirm={() => {
            cancelTask(taskId);
            setShowCancelConfirm(false);
          }}
          onCancel={() => setShowCancelConfirm(false)}
          confirmLabel="Yes, cancel task"
          cancelLabel="Keep task"
          destructive
        />
      )}
    </div>
  );
}
