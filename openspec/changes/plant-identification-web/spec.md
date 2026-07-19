# Spec: plant-identification-web

## Requirements

### R-1 — Multi-photo identification with organ tagging

`IdentifyPlantScreen` MUST let a user attach 1..5 photos before submitting,
each tagged with one organ (`leaf | flower | fruit | bark | habit | other`).
Submitting MUST send all photos in a single `identify()` call — never one
call per photo.

### R-2 — Result rendering has three distinct states

The result panel MUST render one of: `resolved` (species name, confidence,
"Crear planta con esta especie" CTA), `no_match` (candidate list if any,
link to the existing manual create-plant flow, no CTA), or a provider/quota
error (retryable, distinct copy from `no_match` — MUST NOT be presented as
"no plant recognized" when the actual cause is the identification service
being unavailable or rate-limited).

### R-3 — Converting an identification uses the dedicated mutation, not generic `createPlant`

`CreatePlantFromIdentificationModal` MUST call
`createPlantFromIdentification(identificationId, name)` — it MUST NOT call
the generic `createPlant` mutation, even though the fields it needs
(species, image) are already known. This is required so the api can record
`convertedToPlantId` back onto the identification.

### R-4 — Nothing beyond the normal query cache is persisted client-side

Identification photos, results, and history MUST NOT be written to Zustand,
`localStorage`, or any other persistent client store — TanStack Query's
normal in-memory cache is the only client-side state for this feature.

### R-5 — Recent identifications reflect conversion state

`RecentIdentificationsList` MUST show, for each past attempt, whether it was
`resolved`/`no_match` and, if `convertedToPlantId` is set, a link to that
plant's detail page. The list MUST refetch after a successful conversion so
the just-converted entry's link appears without a manual page reload.

### R-6 — Entry point is discoverable from the plants list

`plants-list.screen.tsx` MUST expose an "Identificar planta" action next to
the existing "Crear planta" action, linking to `/[lang]/plants/identify`.
