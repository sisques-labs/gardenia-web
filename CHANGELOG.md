# Changelog

All notable changes to this project will be documented in this file.
## [0.9.1-alpha.0] - 2026-06-03

### Bug Fixes
- **config:** Proxy API and GraphQL through Next.js rewrites (5c1daa2)
## [0.9.0-alpha.0] - 2026-06-03

### Chore
- **openspec:** Archive rest-to-graphql SDD change (a66728b)
- Remove unused TypeScript environment and build info files (e30739e)
- Release v0.9.0-alpha.0 (ee6bdf9)

### Documentation
- **openspec:** Add GQL repository structure convention to config (88e3eb8)

### Features
- **graphql:** Add Apollo link chain with auth, space, and error handling (0be2d51)
- **spaces:** Migrate SpacesHttpRepository from REST to GraphQL (6675073)
- **graphql:** Migrate spaces repository from REST to GraphQL (6f5f8b9)
- **plants:** Migrate PlantsHttpRepository to GQL adapter (PR3) (94d0f41)

### Refactor
- **graphql:** Split spaces GQL repo into graphql/ subdirectory (41c4ab8)
## [0.8.3-alpha.0] - 2026-06-02

### Bug Fixes
- **plants:** Align UI with design — card footer, sidebar nav items, QR section, action buttons (c1702ce)
- **plants:** Update list screen test fixture with new i18n keys (561ea92)

### Chore
- Release v0.8.3-alpha.0 (f123761)
## [0.8.2-alpha.0] - 2026-06-02

### Bug Fixes
- **sidebar:** Add Gardenia brand header, move space section to bottom, improve active space label (424d39b)

### Chore
- Release v0.8.2-alpha.0 (615b95a)
## [0.8.1-alpha.0] - 2026-06-02

### Bug Fixes
- **plants:** Redesign list page header to match design — stats, tab bar, filters button (baba7db)
- **plants:** Update detail screen test fixture with new i18n keys (d4c70cb)

### Chore
- Release v0.8.1-alpha.0 (9912d8c)
## [0.8.0-alpha.0] - 2026-06-02

### Chore
- **sdd:** Archive plants-module change artifacts (b5d9e3f)
- Release v0.8.0-alpha.0 (f622fde)

### Features
- **plants:** Add plants module data layer — domain, use-cases, repository, i18n (e61e863)
- **plants:** Add plants module presentation layer — hooks, screens, pages, nav (719a73c)
## [0.7.1-alpha.0] - 2026-06-02

### Bug Fixes
- **auth:** Fix post-login redirect — cookie name, API URL, nav hrefs (539dc86)

### Chore
- Release v0.7.1-alpha.0 (ce9398c)
## [0.7.0-alpha.0] - 2026-06-02

### Chore
- **sdd:** Archive dashboard-home change artifacts (d8d6f90)
- Release v0.7.0-alpha.0 (7a154b3)

### Features
- **home:** Implement HomeTopBar, 5 sections with skeletons, HomeScreen and route (5268bb1)
- **home:** Add Home nav item to sidebar (8ceda9b)

### Refactor
- **home:** Remove unused lang prop from HomeScreen, add i18n TODO to nav label (7684948)
## [0.6.1-alpha.0] - 2026-06-02

### Bug Fixes
- **auth:** Thread locale prop and redirect post-login to /${locale}/home (248d77d)

### Chore
- Release v0.6.1-alpha.0 (c8c5379)

### Features
- **home:** Add i18n foundation for home dashboard context (0f2f736)
## [0.6.0-alpha.0] - 2026-06-02

### Chore
- **sdd:** Archive auth-redesign change (ac1e64e)
- Update .gitignore to include Next.js specific files (18b90d3)
- Release v0.6.0-alpha.0 (2b162cb)

### Features
- **auth:** Add forgot-password vertical slice (f67ee45)
- **auth:** Redesign auth screens with brand design system (fde52f5)
- **auth:** Wire brand panel copy through i18n (5f431fa)
## [0.5.0-alpha.0] - 2026-06-02

### Bug Fixes
- **sidebar:** Correct NavItem icon type to ElementType and add paper-grain to AppShell main (86c8ea9)
- **spaces:** Export SpacesState and fix mock types in SpaceSwitcher test (872d889)

### Chore
- **sdd:** Update apply-progress for sidebar-screen-header PR 2 completion (a89a47c)
- **sdd:** Archive sidebar-screen-header change with full openspec artifacts (866ac8f)
- **claude:** Remove stale agent worktrees (89dd32d)
- Release v0.5.0-alpha.0 (3ea3eab)

### Features
- **sidebar:** Add SidebarProvider with collapse + drawer state (1e18ea1)
- **app-shell:** Add AppShell CSS grid layout component (b16abed)
- **layout:** Wire AppShell into protected layout + fix spaces/new routing (b04641c)
- **sidebar:** Add NavItem and SpaceSwitcher sub-components (65e2720)
- **sidebar:** Add Sidebar component with collapse and mobile drawer (1bb06db)
- **screen-header:** Add ScreenHeader component (8f52513)
- **screens:** Integrate AppShell layout into SpacesListScreen and SpaceCreateScreen (9ecf1ed)

### Refactor
- **sidebar:** Replace SidebarContext with Zustand store at shared/infrastructure/store/sidebar (6c4092d)
- **sidebar:** Move nav-items to sidebar-nav-items/ and space-switcher to its own folder (da27608)
## [0.4.1-alpha.0] - 2026-06-02

### Chore
- Release v0.4.1-alpha.0 (baf976a)

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

