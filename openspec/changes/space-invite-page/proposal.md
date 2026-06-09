# Proposal: space-invite-page

## Intent

Add a frontend `/invite` route that completes the space invitation flow started by QR deep links (`{QR_BASE_URL}/invite?code=...`). The page reads the invitation code from the query string, ensures the user is authenticated, calls `spaceAcceptInvitation`, refreshes the user's spaces, and redirects to the app.

## Scope

- OpenSpec change `space-invite-page` in `gardenia-web`
- Route: `app/[lang]/(auth)/invite/page.tsx` (outside protected shell — no active space required)
- Spaces bounded context: GQL mutation, repository port, use case, hook, screen, i18n
- Login redirect preserves full `returnUrl` including `?code=`

## Out of Scope

- Polished invitation UI (minimal status text for now)
- Listing invited members in space user list (#167 in gardenia-api)
- Server-side middleware guard for `/invite`

## Rollback

Remove the route and spaces accept layers; QR links fall back to manual API testing until a replacement ships.
