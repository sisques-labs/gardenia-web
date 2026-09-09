# Dependencies Specification

## Purpose

Tracks the security baseline of core framework dependencies (`next`, `eslint-config-next`) enforced by the Docker/Trivy CI gate, and confirms that a version bump addressing published vulnerabilities introduces no change to any user-facing or system capability described elsewhere in `openspec/specs/`.

## Requirements

### Requirement: Next.js Framework Security Baseline

The system MUST run on `next` and `eslint-config-next` versions carrying no known CRITICAL-severity published advisory reachable from this application's code paths, as enforced by the Docker/Trivy image scan gate (`block_on_critical: true`).

#### Scenario: Vulnerable Next.js version blocks the image gate

- GIVEN `next` is pinned to a version with a CRITICAL-severity advisory affecting a reachable path (e.g. AVIF Image Optimization RCE, GHSA-2xp9-vwfh-vxw4, relevant here because 19 `next/image` call sites serve user-uploaded content)
- WHEN the Docker image is scanned by Trivy in CI
- THEN the gate reports the image as blocked

#### Scenario: Patched Next.js version passes the image gate

- GIVEN `next` and `eslint-config-next` are pinned to `16.3.4` in lockstep
- WHEN the Docker image is scanned by Trivy in CI
- THEN the gate reports no CRITICAL-severity finding for `next`

### Requirement: Dependency Security Upgrade Preserves Existing Behavior

A dependency version bump made solely to resolve security advisories MUST NOT change any existing user-facing or system capability described elsewhere in `openspec/specs/`.

#### Scenario: `next/image` AVIF rendering is unchanged

- GIVEN a screen renders a user-uploaded photo via `next/image` with AVIF optimization enabled
- WHEN `next` is upgraded from `16.2.10` to `16.3.4`
- THEN the image still renders correctly with AVIF optimization enabled (not disabled, as it would be if pinned to the interim `16.3.3` release)

#### Scenario: No other spec'd behavior changes

- GIVEN the existing `auth/auth-ui` and `auth/forgot-password` specs describe current auth behavior
- WHEN the `next`/`eslint-config-next` security upgrade is applied
- THEN none of their requirements or scenarios change, and no new requirement is introduced outside this `dependencies` domain
