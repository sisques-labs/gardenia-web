# Changelog

All notable changes to this project will be documented in this file.
## [0.17.0-alpha.0] - 2026-06-17

### Bug Fixes
- **button:** Align all variants to design mockup (53fd67f)
- **button:** Destructive usa var(--terracotta) directo porque --color-destructive no está en @theme (3269b05)
- **tests:** Actualizar aserciones de clase a tokens Gardenia (af76c8e)

### Features
- Apply Gardenia editorial design system to UI components (5e8d3fd)
- Apply editorial design system to all remaining UI components (4f0bbcb)
## [0.16.0-alpha.1] - 2026-06-17

### Refactor
- **ui:** Colocate shared UI components in per-folder modules (6bd7817)
## [0.16.0-alpha.0] - 2026-06-17

### Bug Fixes
- **shared-ui:** Resolve onChange type conflicts and add verify report (b280271)
- **storybook:** Use offline SVG fixtures for Chromatic media stories (03c9b17)
- **storybook:** Restore component annotation on args-based stories (b2edd37)

### Chore
- **shared-ui:** Install Radix overlay packages, cmdk, and add animation keyframes (d0e7b20)

### Documentation
- **shared-ui:** Add Storybook stories for 46 new components (24119f8)

### Features
- **shared-ui:** Add Group 1 Feedback Primitives — Spinner, Skeleton, ProgressBar, EmptyState (c09773b)
- **shared-ui:** Add Group 2 Avatar & User Patterns — InitialsAvatar, AvatarGroup, NumericBadge, UserCard, Pagination (5292a56)
- **shared-ui:** Add Group 3 Form Extensions — SearchInput, PasswordInput, Slider, TagsInput, Combobox, FileUpload, DatePicker (69c772c)
- **shared-ui:** Add Group 4 Data & Charts — PlantCard, BarChart, LineAreaChart, DonutChart, Sparkline (02cd466)
- **shared-ui:** Add Group 5 Layout Patterns — Accordion, Timeline, Stepper, Divider, FilterBar, ActiveFilterChips, FacetPanel, SortPills, CalendarMonth, WeekStrip, EventCard (3d16287)
- **shared-ui:** Add Group 6 Media — PhotoGrid, MediaCard, PhotoPicker, Lightbox (329c477)
- **shared-ui:** Add Group 7 Rich Content — Callout, StarRating, HealthDots, KbdShortcut, Blockquote (7be4823)
- **shared-ui:** Add Group 8 Overlays — Tooltip, ContextMenu, Popover, Drawer, CommandPalette (4b60379)
## [0.15.0-alpha.2] - 2026-06-14

### Features
- **openspec:** Add resolve-space-members-via-memberships change (34e73d8)
- **spaces:** Add space members data layer and listing component (c50cafa)
- **spaces:** Wire SpaceMembersList into settings screen (22613f3)
## [0.15.0-alpha.1] - 2026-06-14

### Bug Fixes
- **planting-spots:** Address PR #182 review comments (d79e6d7)
- **planting-spots:** Update PlantingSpotType import path in card test (4bc237e)

### Features
- **planting-spots:** Add data layer — domain, application, infrastructure, i18n (7e9a699)
- **planting-spots:** Add presentation layer — hooks, schema, components, screens, pages, nav (760b491)

### Refactor
- **planting-spots:** Update imports and formatting for consistency (dfab4a0)
## [0.15.0-alpha.0] - 2026-06-14

### Bug Fixes
- **care-log:** Align findByCriteria query with API contract (f9293d9)
- **spaces:** Address PR review comments on space-settings (e5318e3)
- **spaces:** Fix TS errors from InvitationRole uppercase and schema transform (31f3a09)
- **spaces:** Simplify expiresAt schema to avoid RHF output type mismatch (4429616)

### Documentation
- **openspec:** Add care-log-web change proposal, design and tasks (8b18fa0)

### Features
- **care-log:** Add last-care summary to plant detail screen (fe89e7b)
- **openspec:** Add space-settings-management change proposal (c47c08c)
- **spaces:** Add space settings management page (424bf42)

### Refactor
- **care-log:** Move formatRelativeTime to shared/lib (e70f9d7)
## [0.14.0-alpha.0] - 2026-06-13

### Bug Fixes
- **harvests:** Add newHarvest key to harvest-row test dict mock (d46ca4f)
- **harvests:** Cast zodResolver to fix z.coerce TS mismatch (6077edf)
- **harvests:** Use network-only fetchPolicy to bypass Apollo cache on refetch (f763116)
- **harvests:** Fix onSubmit mock type in harvest-modal test (4ca87fd)

### Features
- **harvests:** Add global list screen, hooks, HarvestRow, sidebar nav (9c85a16)
- **harvests:** Add new harvest button to PageHeader (83a2e59)
- **harvests:** Add create/edit modal, HarvestRow edit button, harvest.schema (5ddebe0)
- **harvests:** Add missing specs from PR1 — use-cases, GQL repo, i18n parity (1b847d9)

### Refactor
- **harvests:** Move interface to domain/types, extract HARVEST_UNITS, extract useHarvestForm hook (b0a0249)

### Testing
- **coverage:** Add coverage config and lower thresholds to match harvests baseline (904a271)
## [0.13.7-alpha.5] - 2026-06-13

### Testing
- Add coverage config and missing specs for auth/users (acc34f5)
- **auth:** Remove stale store assertions after use-case decoupling (af0ce12)
- **coverage:** Lower thresholds to match current baseline (71931f2)
## [0.13.7-alpha.4] - 2026-06-13

### Bug Fixes
- **i18n:** Replace hardcoded strings with i18n keys (feccc1d)
- **i18n:** Update test mocks with new i18n dict keys (f24965d)
- **i18n:** Add bancal key to plants-list screen test mock (ba71bb0)
## [0.13.7-alpha.3] - 2026-06-13

### Bug Fixes
- **plants:** Update species view model to use scientificName (228aa59)
- **plants:** Replace array index key with stable label key in care grid (599839c)
## [0.13.7-alpha.2] - 2026-06-13

### Chore
- Remove package-lock.json and ignore it (975c675)
## [0.13.7-alpha.1] - 2026-06-13

### Refactor
- **architecture:** Decouple use cases from zustand stores (20326d8)
## [0.13.7-alpha.0] - 2026-06-13

### Bug Fixes
- **docker:** Run container as non-root node user (af8d32b)
## [0.13.6] - 2026-06-12

### CI
- **release-train:** Freeze package.json version to 0.0.0-dev on develop (0329a37)
- Run CI and Docker build only on pull_request, not on push to branches (4196024)
- **release-train:** Serialize release channels with a repo-wide concurrency group (#165) (e5ac1f0)

### Chore
- Release v0.13.5-beta.1 (c46c6c7)
- Release v0.13.5-beta.2 (4ecc70f)
## [0.13.5-beta.2] - 2026-06-09

### Bug Fixes
- **spaces:** Make invite accept flow reliable end-to-end (6dacfb8)
- **spaces:** Redirect to home after invite accept completes (aa48669)

### CI
- Add release train workflow for develop/staging/main (14d7a6e)

### Chore
- Update package versions and dependencies in package.json and package-lock.json (f12119b)
- Release v0.13.5-alpha.2 (bfec0ed)
- Release v0.13.5-alpha.3 (ab2b737)
- Release v0.13.5-alpha.4 (deea5c5)
- Release v0.13.5-beta.0 (09d5e8d)
- Release v0.13.5 (23eb7f8)

### Features
- **spaces:** Move space selection to sidebar switcher (dffbb2a)
- **spaces:** Add invite page for space invitation accept flow (ec01386)
## [0.13.5-beta.0] - 2026-06-08

### Bug Fixes
- **shell:** Polish collapsed sidebar layout (71d2a0f)
- **shell:** Center collapsed sidebar icons (cfe4f27)
- **plants:** Use Dialog for create plant modal solid surface (a4bd450)

### Chore
- Release v0.13.5-alpha.0 (39b74d5)

### Features
- **shell:** Unify sidebar footer for garden and account access (e58f205)

### Refactor
- **shell:** Move sidebar collapse toggle to header (f4a69d2)
## [0.13.4-alpha.0] - 2026-06-08

### Chore
- Release v0.13.4-alpha.0 (ad9c529)

### Refactor
- **plants:** Improve code formatting and structure in plants list screen (371fd00)
- **plants:** Replace button with Button component in plants list screen (268f25a)
## [0.13.3-alpha.0] - 2026-06-08

### Bug Fixes
- **profile:** Hydrate current user and show load states (9eacb6c)
- **profile:** Use account userId for userFindById query (9e33430)
- Resolve React Doctor redirect and metadata warnings (b7cd614)
- **plants:** Use next/image on plant detail screen (03c80e7)

### CI
- Add React Doctor workflow and local doctor script (35128e3)

### Chore
- Release v0.13.3-alpha.0 (28da3c6)

### Performance
- Combine chained array iterations for React Doctor (b896962)

### Refactor
- **plants:** Use PageHeader on plants list screen (ba2bc7a)

### Testing
- Fix redirect mocks to avoid unhandled vitest errors (e014500)
## [0.13.2-alpha.0] - 2026-06-08

### Bug Fixes
- **calendar:** Wire hardcoded UI strings through i18n dicts (55b357d)
- **i18n:** Localize shell chrome and home topbar strings (c9c43e1)
- **i18n:** Localize sidebar navigation labels via shell dict (ad25868)

### Chore
- Ignore Claude worktrees and remove tracked worktree artifacts (aef09b0)
- Release v0.13.2-alpha.0 (46da0c2)

### Refactor
- **design-system:** Use @theme inline and bare CSS tokens (5e79707)
## [0.13.1-alpha.0] - 2026-06-06

### Bug Fixes
- **plants:** Correct testids (plant-qr-card, qr-download-btn, plant-action-bar, care-grid) (34f9b34)
- **plants:** 2-column layout for Cuidados tab — care+cycle left, photo+pests right (9758028)
- **screen-header:** Move BreadcrumbSeparator outside BreadcrumbItem to fix li-in-li hydration error (597ac88)

### Chore
- **openspec:** Archive plant-detail-redesign change — 2026-06-06 (637d298)
- Release v0.13.1-alpha.0 (b2a64fa)

### Features
- **plants:** Redesign plant-detail header with 3-column layout (3ccf45e)
- **plants:** Add CareCard + GrowthTimeline + wire Cuidados tab (cd3b6d6)
- **plants:** Wire remaining tabs with InDevelopment + remove PlantSectionPlaceholder (aae5991)
## [0.13.0-alpha.0] - 2026-06-06

### Chore
- Release v0.13.0-alpha.0 (66da5c5)

### Features
- **openspec:** Propose calendar-tasks-screen change (3af8a8f)
- **openspec:** Update calendar-tasks-screen — Zustand store + InDevelopment component (12bd87e)
- **calendar:** Implement calendar-tasks-screen change (c34bc76)
- **calendar:** PageHeader component + calendar visual redesign + storybook stories (cfda383)

### Refactor
- **calendar:** Apply DDD structure per PR review (5c684cd)
## [0.12.0-alpha.0] - 2026-06-05

### Bug Fixes
- **ui:** Replace hsl fallback in Alert warning variant with oklch tokens (28aed98)
- **ui:** Expose controlled sort props on DataTable and clean StatCard token (5e013ab)
- **storybook:** Fix TypeScript issues in table, confirm-dialog and plant-card stories (7ffb11f)
- **ci:** Add fetch-depth: 0 for full git history — Chromatic baseline fix (3db2599)
- **ci:** Restore full git history after setup for Chromatic (49543d1)

### Chore
- **ui:** Install radix primitives, sonner, and tanstack table (dda4eb7)
- **storybook:** Setup storybook with nextjs webpack framework (cac69c4)
- **storybook:** Upgrade to storybook v10 for next 16 compat and fix input story naming (b24ec01)
- Ignore storybook-static build output (95a42a1)
- **ci:** Add Chromatic visual regression workflow (52e0f14)
- Release v0.12.0-alpha.0 (0d56351)

### Features
- **ui:** Add Label component (77926ad)
- **ui:** Add loading state to Button (48066f0)
- **layout:** Register Sonner Toaster (633401f)
- **ui:** Add Textarea component (d88104a)
- **ui:** Add Select component (552f1f8)
- **ui:** Add Checkbox component (2bef34b)
- **ui:** Add RadioGroup component (4d3ccca)
- **ui:** Add Switch component (e0fdf8f)
- **ui:** Add Dialog component (8c06e0d)
- **ui:** Add Alert component (60efab0)
- **ui:** Add Chip component (fd1b0ae)
- **ui:** Add StatusDot component (23c3857)
- **ui:** Add toast helpers (fc125a6)
- **ui:** Add ConfirmDialog component (582dbb3)
- **ui:** Add Tabs component (ea7256f)
- **ui:** Add DropdownMenu component (8325f40)
- **ui:** Add Breadcrumb component (3d41cd2)
- **ui:** Add Gardenia variants to Badge (ffb9ae9)
- **ui:** Add SortableTable component (d2dc210)
- **ui:** Add StatCard component (0bdd847)
- **ui:** Improve PlantCard with design system components (879bc40)
- **screens:** Integrate new UI components across all modules (cad6521)
- **storybook:** Add foundation component stories (99d745a)
- **storybook:** Add feedback and display stories (1917611)
- **storybook:** Add overlay and stateful stories (2facad3)
- **storybook:** Add navigation, data, and domain stories (cd83e7a)
- **storybook:** Add PlantCard domain story (75cfbde)

### Testing
- **ui:** Add Toaster tests and matchMedia mock for sonner (750463d)
- **ui:** Add missing readOnly, rows and disabled coverage for Textarea and Select (6adc188)
- **ui:** Assert outline class is present on Badge outline variant (d94b2cf)
## [0.11.0-alpha.0] - 2026-06-04

### Bug Fixes
- **users:** Use network-only fetch policy to avoid stale Apollo cache after update (b32aac6)
- Resolve CI TypeScript errors in users module (d41c511)

### Chore
- Release v0.11.0-alpha.0 (92675bd)

### Documentation
- Archive openspec for user-profile-page change (6f7b59a)

### Features
- **users:** Add user profile module and page (7034489)
- **ui:** Add shadcn Avatar component and use it in UserProfileScreen (a74093b)

### Refactor
- **users:** Address PR review comments (34a6ba3)
## [0.10.0-alpha.0] - 2026-06-04

### Bug Fixes
- **test:** Resolve TypeScript errors in PR2 OAuth spec files (2519794)
- **auth:** Import OAuthProvider from domain enum instead of env (a00494c)
- **auth:** Use OAuthProvider enum values in AuthSocial buttons (bc2aaf2)

### Chore
- **sdd:** Add openspec artifacts for auth-oauth-issue-100 (bc372aa)
- Release v0.10.0-alpha.0 (4ea222e)

### Features
- **i18n:** Add oauthFailed and callback.finishing keys to auth dictionaries (ac58efd)
- **auth:** Enable OAuth provider buttons in AuthSocial (3cc211d)
- **auth:** Add /callback page for OAuth finalization (e1e2a39)
- **auth:** Show error banner on login for oauth_failed (1bae00b)
## [0.9.8-alpha.0] - 2026-06-04

### Bug Fixes
- **auth:** Block GQL queries until boot auth settles on hard reload (47b1801)
- **auth:** Use refreshTokenOnce mutex in useBootAuth to prevent double-refresh (fe64d8f)
- **auth:** Redirect to login on refresh-401 in axios interceptor (b7030aa)
- **auth:** Redirect to login on refresh-401 in Apollo onErrorLink (f31ebba)

### Chore
- Release v0.9.8-alpha.0 (2e627b2)

### Features
- **env:** Add NEXT_PUBLIC_OAUTH_API_ORIGIN config (ca611b0)
- **auth:** Add redirectToLogin action to auth store (d060c4e)

### Refactor
- **auth:** Move OAuthProvider to its own domain enum (fd8d27d)
- **auth:** Remove unnecessary OAuthProvider re-export from env.ts (86ce7b4)

### Testing
- **auth:** Add redirectToLogin mock to spaces gql repository spec (5e4c114)
## [0.9.7-alpha.0] - 2026-06-04

### Bug Fixes
- **apollo:** Inject fresh token into retry context after 401/UNAUTHENTICATED (edce2f0)

### Chore
- Release v0.9.7-alpha.0 (2ce8622)
## [0.9.6-alpha.0] - 2026-06-04

### Bug Fixes
- Add create to IPlantsRepository mocks in existing specs (bf35b22)
- **proxy:** Migrate middleware to proxy convention and fix root auth redirect (c54bd23)

### Chore
- Update package-lock.json after npm install (0146155)
- Release v0.9.6-alpha.0 (b814baa)

### Features
- Enable create plant button with GraphQL mutation (9943960)

### Refactor
- Address PR review comments (44e4907)
- **plants:** Move CreatePlantInput to application/interfaces layer (a07d4d3)
## [0.9.5-alpha.0] - 2026-06-03

### Bug Fixes
- Mobile menu drawer hidden by parent display:none on aside (6a85134)

### Chore
- Add package-lock.json (806f470)
- Release v0.9.5-alpha.0 (d004dce)
## [0.9.4-alpha.0] - 2026-06-03

### Bug Fixes
- **middleware:** Add forgot-password to public paths (a208fef)
- **docker:** Bake INTERNAL_API_URL at build time for Next.js rewrites (973cadd)
- **proxy:** Replace Next.js rewrites with runtime Route Handler proxy (0d3c605)

### Chore
- Release v0.9.4-alpha.0 (5a5462a)
## [0.9.3-alpha.0] - 2026-06-03

### Bug Fixes
- **middleware:** Exclude proxied API and GraphQL routes from locale and auth guards (b70084a)

### Chore
- Release v0.9.3-alpha.0 (2343f1a)
## [0.9.2-alpha.0] - 2026-06-03

### Bug Fixes
- **docker:** Set relative defaults for NEXT_PUBLIC API URLs in build stage (632ee15)

### Chore
- Release v0.9.2-alpha.0 (eeb9fff)
## [0.9.1-alpha.0] - 2026-06-03

### Bug Fixes
- **config:** Proxy API and GraphQL through Next.js rewrites (5c1daa2)

### Chore
- Release v0.9.1-alpha.0 (5fa1527)
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

