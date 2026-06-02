# Changelog

All notable changes to this project will be documented in this file.
## [0.4.1-alpha.0] - 2026-06-02

### Features
- **design:** Integrate Gardenia design tokens and brand identity (1ebed3e)
## [0.4.0-alpha.0] - 2026-06-01

### Chore
- **env:** Document Next.js public URLs and bake them in Docker builds (2ed6ee3)
- Release v0.4.0-alpha.0 (34e618c)

### Features
- **spaces:** Add spaces module with full DDD structure, i18n, and shell layout (77b4e1f)
- **protected:** Extract ProtectedProviders for protected route composition (63d6607)
## [0.3.0-alpha.0] - 2026-06-01

### Bug Fixes
- **tsconfig:** Add node to types for process.env resolution (3a6e55c)
- **husky:** Update pre-push hook to use tsconfig.json instead of tsconfig.app.json (8fca2d7)
- **tsconfig:** Add vitest/globals and jest-dom types for test files (0ccb3d0)
- **build:** Wrap LoginScreen in Suspense for useSearchParams, rename middleware to proxy (8658243)
- **build:** Revert proxy.ts to middleware.ts — proxy convention is canary only (04d3bdd)
- **docker:** Add .gitkeep to public/ so Docker COPY doesn't fail on empty dir (65836c9)

### Chore
- Remove Angular source and PR1 scaffold — fresh Next.js start (c74d252)
- Remove Angular source and PR1 scaffold — fresh Next.js start (8040688)
- **i18n:** Use Castilian Spanish (es-ES) in auth translations, add variant convention (bdfed7b)
- Release v0.3.0-alpha.0 (e6b4853)

### Features
- **scaffold:** Migrate to Next.js 15 with shadcn/ui, Vitest, and Node server Dockerfile (7c5c0ff)
- Initialize Next.js 16 project with create-next-app (a2d4f51)
- **deps:** Add TanStack Query v5 and Apollo Client v4 for GraphQL (ed0203a)
- **providers:** Add DDD provider structure with TanStack Query and Apollo (911562a)
- **providers:** Add DDD provider structure with TanStack Query and Apollo (a8b52c2)
- **base:** Add shadcn/ui components, Vitest setup, and DDD provider pattern (f327c4c)
- **auth:** Add auth module with DDD structure, refresh mutex, and React Hook Form pages (97a2459)
- **auth:** Add auth module with DDD structure, refresh mutex, and React Hook Form pages (ba7b290)
- **i18n:** Add per-module TypeScript dictionaries with [lang] routing and parity tests (59742b9)

### Refactor
- **auth:** Rename pages to screens, replace ky with axios, fix Dockerfile with standalone output (40632cd)
- **auth:** Rename services to use-cases, replace ky with axios, update openspec conventions (e627db4)
- **auth:** Rename LoginPage/RegisterPage components to LoginScreen/RegisterScreen (4c6099e)
- **auth:** Extract schemas to presentation/schemas/, reorganize hooks to hooks/{name}/{name}.hook.ts (3ae5beb)
- **auth:** Rename service files and classes to use-case convention (3e9270b)
- **i18n:** Move i18n into presentation/i18n per module, update conventions (5ad541a)
- **i18n:** Move shared/i18n into shared/presentation/i18n, update all imports and conventions (1d1eee4)
## [0.2.0-alpha.0] - 2026-05-31

### Bug Fixes
- **spaces:** Replace fakeAsync with sync tests and fix resolveFromStorage signal update (8845458)
- **spaces:** Replace fakeAsync with sync tests and fix resolveFromStorage signal update (b9e4210)
- **tests:** Mock SpacesStateService in app.spec and remove fakeAsync from guard spec (e2a1016)
- **tests:** Provide SpacesStateService mock in header spec (9dd5015)

### Chore
- **sdd:** Archive multitenant-frontend change (b8af549)
- **openspec:** Add project conventions config (aac55bf)
- Release v0.2.0-alpha.0 (5e3af12)

### Features
- **spaces:** Add EventBus infrastructure and fix auth register response (58b89c4)
- **spaces:** Add spaces DDD domain, application layer and infrastructure stubs (741c1d0)
- **spaces:** Add interceptor, space guard, shell routing and presentation pages (cd5f5da)
## [0.1.2-alpha.0] - 2026-05-29

### Chore
- **tooling:** Add OpenSpec for spec-driven development workflow (e5ae59e)
- Release v0.1.2-alpha.0 (6f93623)
## [0.1.1-alpha.0] - 2026-05-29

### Chore
- **changelog:** Add git-cliff config (86b9c70)
- Release v0.1.1-alpha.0 (2e136e1)
## [0.1.0-alpha.0] - 2026-05-29

### Bug Fixes
- **auth:** Add Angular environment files and fix API_URL prefix (344109a)
- **auth:** Use @/ path aliases in application services, add services/ subfolder (4143347)
- **auth:** Use tap complete instead of finalize in LogoutService (52cbf65)
- **docker:** Approve pnpm build scripts for native deps (9c3c794)
- **docker:** Use --ignore-scripts + rebuild to bypass pnpm approve-builds (853d694)
- **ci:** Bypass pnpm approve-builds with --ignore-scripts + rebuild (75d9e6e)
- **ci:** Downgrade to pnpm@9.15.4 to match gardenia-api and avoid approve-builds (1e8c087)
- **ci:** Disable tests in release workflow, already gated by CI (4961332)
- **test:** Make pnpm test headless by default, add test:watch for local dev (150b2e2)

### Chore
- Implement initial project structure and setup (2982743)
- Add .env.example file (19c4836)
- Update package.json to include uuid and modify tsconfig for path mapping (84a891e)
- Add packageManager field for pnpm CI detection (c849cfd)
- **env:** Track environment.ts — API URL is not a secret (c8c24f6)
- **ci:** Add Dependabot for npm, GitHub Actions and Docker (06fecf9)
- Release v0.1.0-alpha.0 (6c9b84e)

### Documentation
- **readme:** Document environment setup for production builds (24b9130)

### Features
- **design-system:** Establish Gardenia design system foundations with Tailwind v4 (da344ee)
- **ci:** Add GitHub Actions CI workflow, Husky hooks, and ESLint (baa2eb8)
- **header:** Integrate app-header component into the main application layout (ce0d40c)
- **ui:** Add core atom components — Button, Badge, Icon (db7f305)
- **ui:** Add layout components — Card and Header rewrite (811b8ed)
- **ui:** Add form components — Input, Textarea, Select with CVA (565c533)
- **auth:** Implement authentication from gardenia-api (5bba863)
- **ci:** Add Docker build, smoke CI, and release workflows (df04c1b)

### Refactor
- **auth:** Move presentation layer to core/auth/presentation (16c60c3)
- **auth:** Split AuthService into focused use-case services (3f41274)
- **auth:** Move service files into services/ subfolder per use case (d6a6994)
- **auth:** Restructure to application/services/{name}/ convention (54f54ae)
- **auth:** Move auth repository port to application/ports/ (78a863b)
- **auth:** Move guards to own folders and add specs (ac12ab1)

### Testing
- **auth:** Add provideZonelessChangeDetection to all specs (b6fe563)

