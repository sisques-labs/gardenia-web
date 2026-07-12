# Nodes Specification

## Purpose

Minimal `gardenia-web` surface for the IoT `nodes` context: claim a bridge
into the active Space, and see the nodes it relays.

## Requirements

### Requirement: Claim a bridge

The system MUST let an authenticated user claim a bridge into their active
Space by submitting the bridge id and pairing code shown by the bridge.

On success the bridges list MUST refresh without a manual page reload.

#### Scenario: Successful claim

- GIVEN a user with an active Space
- WHEN they submit a valid bridgeId + pairingCode
- THEN the bridge appears in the bridges list as claimed

#### Scenario: Wrong pairing code

- GIVEN a user submits an incorrect pairing code
- WHEN the claim mutation runs
- THEN an inline error is shown and the bridge is not added to the list

### Requirement: List nodes

The system MUST display every node in the active Space with its name (or
id, if unnamed), status, and last-seen timestamp.

#### Scenario: Empty state

- GIVEN the active Space has no bridges claimed yet
- WHEN the nodes screen loads
- THEN an empty state is shown instead of an empty table

## Out of Scope

- Telemetry history/charts.
- Sending commands to nodes.
- Bridge rename/unclaim.
