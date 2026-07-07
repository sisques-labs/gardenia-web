import { Calendar, Sprout, User } from 'lucide-react';
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
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-bg text-forest"
          >
            <Sprout className="h-5 w-5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="eyebrow">{dict.details.title}</p>
            {space && (
              <h2 data-testid="space-name" className="headline truncate text-2xl">
                {space.name}
              </h2>
            )}
            {isLoading && !space && (
              <div className="mt-1 h-6 w-40 animate-pulse rounded bg-muted" />
            )}
          </div>
        </div>

        {isError && <Alert variant="error" message={dict.errors.loadFailed} />}

        {isLoading && !space && (
          <div className="flex flex-col gap-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        )}

        {space && (
          <dl className="dashed-rule grid grid-cols-1 gap-x-6 gap-y-3 pt-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="eyebrow flex items-center gap-1.5">
                <User className="h-3 w-3" aria-hidden /> {dict.details.owner}
              </dt>
              <dd
                data-testid="space-owner"
                className="truncate font-mono text-xs text-ink-2"
              >
                {space.ownerId}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="eyebrow flex items-center gap-1.5">
                <Calendar className="h-3 w-3" aria-hidden /> {dict.details.createdAt}
              </dt>
              <dd data-testid="space-created-at" className="text-sm text-ink-2">
                {new Date(space.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
