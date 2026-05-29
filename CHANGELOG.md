# Changelog

All notable changes to this project will be documented in this file.
## [0.1.1-alpha.0] - 2026-05-29

### Chore
- **changelog:** Add git-cliff config (86b9c70)
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

