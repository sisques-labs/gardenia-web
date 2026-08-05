# Gardenia

Gardenia is a gardening companion web application that helps you track your plants, spaces, care logs, harvests, and planting calendar — all in one place.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI primitives | [Radix UI](https://www.radix-ui.com/) |
| State / data | [TanStack Query](https://tanstack.com/query), [Zustand](https://zustand-demo.pmnd.rs/), [Apollo Client](https://www.apollographql.com/docs/react/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Tests | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Component dev | [Storybook](https://storybook.js.org/) |
| Package manager | [pnpm](https://pnpm.io/) |

## Prerequisites

- Node.js 24
- pnpm 11.17.0 (pinned via `packageManager` in `package.json` — `corepack enable` picks it up automatically)

## Environment setup

Copy the example env file and edit the values for your local environment:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | REST API base URL (e.g. `http://localhost:3000/api`) |
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL endpoint (e.g. `http://localhost:3000/graphql`) |

## Getting started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page hot-reloads on file changes.

## Available scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:changed` | Run tests affected by changed files |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build the static Storybook |
| `pnpm doctor` | Run [react-doctor](https://react.doctor/) checks |

## Architecture

DDD + Hexagonal (Screaming Architecture). Bounded contexts live under `src/core/{context}/`, each split into four layers:

| Layer | Contains |
|-------|----------|
| `domain/` | Pure TypeScript — `interfaces/` (DTOs/contracts), `models/`. Zero framework imports. |
| `application/` | `use-cases/{name}/` (one per use case) + `ports/` (repository interfaces). Reads/writes the store only via `getState()`. |
| `infrastructure/` | `repositories/graphql/` (Apollo-backed), `store/` (Zustand), `http/` (shared axios/Apollo clients) |
| `presentation/` | `screens/`, `hooks/` (TanStack Query wrappers), `providers/` |

```
gardenia-web/
├── app/                        # Next.js App Router (routes, layouts, route handlers)
│   ├── [lang]/                 # i18n root segment
│   ├── api/                    # Next.js route handlers (proxy to the API)
│   ├── layout.tsx
│   └── page.tsx
└── src/
    ├── core/                   # Bounded contexts (business domains)
    │   ├── auth/
    │   ├── calendar/
    │   ├── care-log/
    │   ├── care-schedule/
    │   ├── harvests/
    │   ├── home/
    │   ├── inventory/
    │   ├── plant-identification/
    │   ├── plant-photos/
    │   ├── planting-spots/
    │   ├── plants/
    │   ├── spaces/
    │   └── users/
    ├── shared/                 # Cross-cutting concerns
    │   ├── config/              # Environment config & validation
    │   ├── domain/              # Shared domain interfaces (e.g. CreatedEntity)
    │   ├── infrastructure/      # HTTP / GraphQL clients
    │   ├── lib/                 # Generic utilities
    │   └── presentation/        # Shared UI components (shadcn), hooks, i18n, providers
    └── design-system/          # Design tokens, palettes, theme CSS
```

A domain never imports application/infrastructure/presentation; application may import domain + infrastructure/store (via `getState()` only); infrastructure may import domain + shared http; presentation may import application use-cases, infrastructure/store, and domain interfaces.

### i18n

Custom TypeScript dictionaries per module (`presentation/i18n/en.ts` + `es.ts`, no JSON/external library), aggregated in `src/shared/presentation/i18n/get-dictionary.ts`. Every module has an `i18n-parity.test.ts` asserting both locales expose the same keys.

## Docker

A 2-stage `Dockerfile` (`node:24-bookworm-slim`) builds with pnpm and runs the Next.js standalone output (`node server.js`, no pnpm/`next start` at runtime). Exposes port `3000`.

## Contributing

1. Base branch is `main`. Branch off it using the naming convention `<type>/<short-description>` (e.g. `feat/add-harvest-form`).
2. Commit following [Conventional Commits](https://www.conventionalcommits.org/) — free scope, no AI attribution in commit messages.
3. Open a PR against `main`, capped at ~400 lines (split into chained PRs if larger).

Pre-commit hooks (Husky + lint-staged) run ESLint on staged TypeScript files automatically. Releases are automated via `release-train.yml` / `release.yml` (git-cliff generates `CHANGELOG.md`).

## License

[MIT](LICENSE)
