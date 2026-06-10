import { Badge } from '@/shared/presentation/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/shared/presentation/components/ui/badge';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const STATUS_VARIANT_MAP: Record<TaskStatus, BadgeVariant> = {
  [TaskStatus.Pending]: 'neutral',
  [TaskStatus.Active]: 'forest',
  [TaskStatus.Completed]: 'sage',
  [TaskStatus.Failed]: 'terra',
  [TaskStatus.Cancelled]: 'outline',
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] ?? 'neutral';
  return (
    <Badge variant={variant} data-testid="task-status-badge">
      {status}
    </Badge>
  );
}
