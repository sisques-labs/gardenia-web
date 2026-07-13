# Design: nodes-module

## Layering

```
app/[lang]/(protected)/nodes/page.tsx     Server — locale + dict
  └─ NodesScreen                          Client
       ├─ useBridges / useNodes           TanStack Query (GetBridgesUseCase / GetNodesUseCase)
       └─ useClaimBridge                  TanStack mutation (ClaimBridgeUseCase)
            └─ nodesGqlRepository.claimBridge()
```

Single screen, two lists (bridges + nodes) — no pagination controls in this
change (both lists are expected to be small for the pilot; add
`findByCriteria` pagination UI when that stops being true, the repository
method already accepts `PaginatedResult`).

## Repository

`INodesRepository`: `listBridges(): Promise<Bridge[]>`,
`listNodes(): Promise<Node[]>`, `claimBridge(bridgeId, pairingCode): Promise<void>`.
Mirrors `ISpacesRepository`'s shape — no criteria param needed yet (both
list methods call `*FindByCriteria` with no filters, matching how
`usePlants` calls `list()` with no criteria today).

## Claim mutation

`bridgeClaim` returns the kit's `{ id, success, message }` shape (same as
`spaceAcceptInvitation`). On success, invalidate `['bridges']` and
`['nodes']` query keys (a newly-claimed bridge's nodes won't exist yet, but
invalidating both keeps the lists consistent without a manual refetch call).

## i18n

`nodes.claim.*` (dialog title/fields/errors), `nodes.list.*` (empty state,
column labels), `shell.nav.nodes`. Spanish: "Dispositivos" for the nav
label (matches how gardening-adjacent apps refer to sensor hardware in
Castilian Spanish — not a literal "Nodos" which reads as networking
jargon to a non-technical gardener).
