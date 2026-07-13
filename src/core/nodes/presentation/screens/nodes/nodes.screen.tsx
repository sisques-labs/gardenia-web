'use client';

import { useState } from 'react';
import { ClaimBridgeDialog } from '@/core/nodes/presentation/components/claim-bridge-dialog/claim-bridge-dialog';
import { useBridges } from '@/core/nodes/presentation/hooks/use-bridges/use-bridges.hook';
import { useNodes } from '@/core/nodes/presentation/hooks/use-nodes/use-nodes.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Badge } from '@/shared/presentation/components/ui/badge/badge';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { NodesListSkeleton } from '@/core/nodes/presentation/components/nodes-list-skeleton/nodes-list-skeleton';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['nodes'];
};

function statusVariant(status: string): 'forest' | 'terra' | 'neutral' {
  if (status === 'ACTIVE' || status === 'ONLINE') return 'forest';
  if (status === 'OFFLINE') return 'terra';
  return 'neutral';
}

export function NodesScreen({ dict }: Props) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const { data: bridges, isLoading: isLoadingBridges } = useBridges(spaceId);
  const { data: nodes, isLoading: isLoadingNodes } = useNodes(spaceId);

  const isLoading = isLoadingBridges || isLoadingNodes;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={dict.title}
        subtitle={dict.subtitle}
        actions={<Button onClick={() => setIsClaimOpen(true)}>{dict.claim.trigger}</Button>}
      />

      <div className="p-4 sm:p-6 flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-2">{dict.list.bridgesHeading}</h2>
          {isLoadingBridges ? (
            <NodesListSkeleton />
          ) : !bridges || bridges.length === 0 ? (
            <p className="text-sm text-ink-2">{dict.list.bridgesEmpty}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {bridges.map((bridge) => (
                <div key={bridge.id} className="card flex items-center justify-between gap-4 p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-ink">{bridge.name ?? bridge.id}</span>
                    <span className="text-xs text-ink-2">{bridge.id}</span>
                  </div>
                  <Badge variant={statusVariant(bridge.status)}>{bridge.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-2">{dict.list.nodesHeading}</h2>
          {isLoading ? (
            <NodesListSkeleton />
          ) : !nodes || nodes.length === 0 ? (
            <p className="text-sm text-ink-2">{dict.list.nodesEmpty}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {nodes.map((node) => (
                <div key={node.id} className="card flex items-center justify-between gap-4 p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-ink">{node.name ?? node.id}</span>
                    <span className="text-xs text-ink-2">
                      {node.lastSeenAt
                        ? `${dict.list.lastSeen}: ${new Date(node.lastSeenAt).toLocaleString()}`
                        : dict.list.neverSeen}
                    </span>
                  </div>
                  <Badge variant={statusVariant(node.status)}>{node.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {isClaimOpen && (
        <ClaimBridgeDialog dict={dict.claim} onClose={() => setIsClaimOpen(false)} />
      )}
    </div>
  );
}
