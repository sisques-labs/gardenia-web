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

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)

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
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build the static Storybook |

## Architecture

The project follows a **Domain-Driven Design (DDD)** approach. Source code lives under `src/` and `app/`.

```
gardenia-web/
├── app/                        # Next.js App Router (routes, layouts, API routes)
│   ├── [lang]/                 # i18n root segment
│   ├── api/                    # Next.js route handlers
│   ├── layout.tsx
│   └── page.tsx
└── src/
    ├── core/                   # Business domains
    │   ├── auth/
    │   ├── calendar/
    │   ├── care-log/
    │   ├── harvests/
    │   ├── home/
    │   ├── inventory/
    │   ├── planting-spots/
    │   ├── plants/
    │   ├── spaces/
    │   └── users/
    ├── shared/                 # Cross-cutting concerns
    │   ├── config/             # Environment config & validation
    │   ├── infrastructure/     # HTTP / GraphQL clients
    │   ├── lib/                # Generic utilities
    │   └── presentation/       # Shared UI components & hooks
    └── design-system/          # Tokens, theme, and base CSS
```

Each domain under `src/core/` is self-contained and may include its own `infrastructure/` (data fetching), `presentation/` (components, hooks), and domain models.

## Docker

A `Dockerfile` is provided for containerised deployments. The Next.js build is configured with `output: 'standalone'` for minimal image size.

## Contributing

1. Branch off `develop` using the naming convention `<type>/<short-description>` (e.g. `feat/add-harvest-form`).
2. Commit following [Conventional Commits](https://www.conventionalcommits.org/).
3. Open a PR against `develop`.

Pre-commit hooks (Husky + lint-staged) run ESLint on staged TypeScript files automatically.

## License

[MIT](LICENSE)
