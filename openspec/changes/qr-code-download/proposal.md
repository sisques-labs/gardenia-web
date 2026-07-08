# Proposal: qr-code-download

## Intent

GDN-40: a user viewing a plant's detail page can see its QR code but has no way to save it —
there is no way to print it and physically attach it to the plant or its pot. The QR image is
already generated and shown on the page (base64 PNG on `plant.qr.image`); the detail screen
even shipped a `qr-download-btn` for it, but the button was left `disabled` with no handler.

## Scope

- `gardenia-web`, `plants` bounded context, presentation layer only — no domain/application/
  infrastructure changes, since the QR image is already returned by the existing `plant` query.
- New shared util `downloadBase64Image` (`src/shared/presentation/utils/`) that turns a base64
  payload into a `Blob` and triggers a browser download via an anchor's `download` attribute.
- New `useQrDownload` presentation hook (`plants/presentation/hooks/`) wrapping the util call —
  the screen calls the hook, not the shared util directly, per the module's screen/hook split.
- Enable the pre-existing (disabled) `qr-download-btn` in `plant-detail.screen.tsx`, wiring it
  to the new hook.
- i18n: correct `plants.detail.qr.download` copy — it read "Download PDF" in both locales,
  which doesn't match the PNG file actually produced.

## Out of Scope

- Changing how the QR code is generated or what it encodes.
- Bulk download of QR codes for multiple plants at once.
- Printing directly from the app (only download is in scope).

## Rollback

Purely additive: revert the button's `onClick`/icon back to `disabled` and delete the new util.
The QR image and its query already existed before this change, so rollback carries no risk to
existing functionality.
