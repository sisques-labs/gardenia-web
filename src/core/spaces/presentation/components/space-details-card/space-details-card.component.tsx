import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import type { SpaceDetail } from '@/core/spaces/domain/interfaces/space-detail.interface';

interface SpaceDetailsCardProps {
  space: SpaceDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  dict: AppDict['spaces']['settings'];
}

export function SpaceDetailsCard({ space, isLoading, isError, dict }: SpaceDetailsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-3">
        <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {dict.details.title}
        </p>
        {isLoading && (
          <div className="flex flex-col gap-2">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        )}
        {isError && (
          <Alert variant="error" message={dict.errors.loadFailed} />
        )}
        {space && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{dict.details.name}</dt>
            <dd data-testid="space-name" className="font-medium">
              {space.name}
            </dd>
            <dt className="text-muted-foreground">{dict.details.owner}</dt>
            <dd data-testid="space-owner" className="font-mono text-xs">
              {space.ownerId}
            </dd>
            <dt className="text-muted-foreground">{dict.details.createdAt}</dt>
            <dd data-testid="space-created-at">
              {new Date(space.createdAt).toLocaleDateString()}
            </dd>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
