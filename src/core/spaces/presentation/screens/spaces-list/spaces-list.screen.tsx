'use client';

import { useRouter } from 'next/navigation';
import { MoreHorizontal, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/shared/presentation/components/ui/badge';
import { Button } from '@/shared/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/presentation/components/ui/dropdown-menu';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { useSpaces } from '@/core/spaces/presentation/hooks/use-spaces/useSpaces.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['spaces']['list'];
  lang: string;
};

export function SpacesListScreen({ dict, lang }: Props) {
  const router = useRouter();
  const { data: spaces = [] } = useSpaces();
  const currentSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const setActiveSpace = useSpacesStore((s) => s.setActiveSpace);

  return (
    <div className="p-6">
      <ScreenHeader
        title="Spaces"
        actions={
          <Button onClick={() => router.push(`/${lang}/spaces/new`)}>{dict.create}</Button>
        }
      />

      <div className="mt-6">
        {spaces.length === 0 ? (
          <p className="text-muted-foreground">{dict.empty}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {spaces.map((space) => (
              <Card key={space.id}>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">{space.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {space.id === currentSpaceId && <Badge variant="forest">{dict.active}</Badge>}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Space actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {space.id !== currentSpaceId && (
                          <>
                            <DropdownMenuItem onClick={() => setActiveSpace(space.id)}>
                              <ArrowRightLeft className="h-4 w-4" />
                              {dict.switchTo}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {space.id === currentSpaceId && (
                          <DropdownMenuItem disabled>
                            <CheckCircle2 className="h-4 w-4" />
                            {dict.active}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <p className="text-xs text-muted-foreground">{space.id}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
