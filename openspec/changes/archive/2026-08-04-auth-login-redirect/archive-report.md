# Archive Report: auth-login-redirect

**Change**: auth-login-redirect
**Archived**: 2026-08-04
**Status**: COMPLETE — all 4 tasks done and verified in code

---

## Summary

Post-login redirect bugfix (wrong API base URL, cookie name mismatch, `[lang]` placeholder in sidebar hrefs). All 4 tasks were already checked off in `tasks.md`; this archive corrects the bookkeeping — no code changes were made.

## Verification

The proposal describes the cookie-name fix as living in `middleware.ts`. The repo has since migrated from `middleware.ts` to `proxy.ts` (`proxy.ts` at the repo root, backed by `src/shared/infrastructure/http/proxy.ts`), but the actual fix is present and correct in the current code:

- `proxy.ts` — `REFRESH_COOKIE = 'refresh_token'` (snake_case, matches the API's cookie name); unauthenticated users are redirected to `/{locale}/login` with a `returnUrl`, authenticated guests are bounced off `/login`/`/register` to `/{locale}/home`.
- `src/shared/presentation/components/sidebar/sidebar.tsx` — `locale` resolved from `pathname`, hrefs built via `item.href.replace('/[lang]', '/${locale}')`, active state via `pathname.startsWith(resolvedHref)`.

No remaining `middleware.ts` file exists in the repo — `proxy.ts` is the sole routing gate and it implements the same behavior the proposal describes.
