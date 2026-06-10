import { Badge } from '@/shared/presentation/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/shared/presentation/components/ui/badge';
import { TaskRunStatus } from '@/core/tasks/domain/interfaces/task-run-status.enum';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const STATUS_VARIANT_MAP: Record<TaskRunStatus, BadgeVariant> = {
  [TaskRunStatus.Pending]: 'neutral',
  [TaskRunStatus.Running]: 'forest',
  [TaskRunStatus.Completed]: 'sage',
  [TaskRunStatus.Failed]: 'terra',
  [TaskRunStatus.Cancelled]: 'outline',
};

interface TaskRunStatusBadgeProps {
  status: TaskRunStatus;
}

export function TaskRunStatusBadge({ status }: TaskRunStatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] ?? 'neutral';
  return (
    <Badge variant={variant} data-testid="task-run-status-badge">
      {status}
    </Badge>
  );
}
