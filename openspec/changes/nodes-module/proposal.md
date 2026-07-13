# Proposal: nodes-module

## Intent

Gardenia is adding IoT support (per-site edge gateways relaying sensor data
via `gardenia-bridge`↔Kafka). `gardenia-api` now exposes the resulting
`nodes` bounded context (bridge claim flow + node listing) — see
`sisques-labs/gardenia-api`'s `openspec/changes/nodes-context/`. This change
adds the minimal `gardenia-web` surface to use it: a way to claim a bridge
into the active Space with its pairing code, and a list of the nodes that
bridge is relaying.

## Scope

- New bounded context `nodes` in `src/core/nodes/` (domain → application →
  infrastructure → presentation), GraphQL-only (matches the API's GraphQL
  surface for this context).
- GQL repository: `bridgesFindByCriteria`, `nodesFindByCriteria`,
  `bridgeClaim` mutation.
- One screen (`/[lang]/nodes`): claimed bridges + a "Claim bridge" dialog
  (bridgeId + pairing code form), and the node list (name, status,
  lastSeenAt) below it.
- Nav entry (`nodes` key in `shell.nav`, sidebar icon).
- i18n (`en`/`es`) with parity test.

## Out of Scope

- Telemetry charts/history (`nodeTelemetryReadingsFindByCriteria` not
  consumed here — no UI need yet, per the architecture vision doc this
  builds on).
- Sending commands to nodes (`nodeSendCommand` not wired — no actuator UI
  exists yet).
- Bridge rename/unclaim.
- Polished empty/loading states beyond the shared skeleton pattern.

## Rollback

Remove the route, nav entry, and `src/core/nodes/` — no other module
depends on it.
