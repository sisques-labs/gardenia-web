# nextjs-foundation Specification

## Purpose

Defines the technical acceptance requirements for the Next.js 15 scaffold: build system, design tokens, UI atom library, test harness, CI pipeline, and Docker deployment. This is a parity migration — all requirements assert behavioral equivalence with the Angular build, not new product behavior.

## Requirements

### Requirement: Node Server Build

The Next.js project MUST build and run as a Node.js server (`next start`). No `output: 'export'` — the server enables middleware.ts to run authoritatively on every request in production. The build MUST complete without errors.

#### Scenario: Successful Node server build

- GIVEN the Next.js project is scaffolded WITHOUT `output: 'export'` in `next.config.ts`
- WHEN `pnpm build` is executed
- THEN the command exits with code 0
- AND a `.next/` directory is produced containing the server and client bundles

#### Scenario: TypeScript strict mode enforced

- GIVEN `tsconfig.json` has `"strict": true`
- WHEN `tsc --noEmit` is executed
- THEN no type errors are reported

---

### Requirement: Tailwind v4 Design Tokens

Tailwind v4 with `@theme` design tokens MUST load and apply correctly. Visual output MUST match the Angular app's design system (same colors, spacing, typography scale).

#### Scenario: Design token CSS loads

- GIVEN the Next.js app imports `src/design-system/*.css` and `src/styles.css`
- WHEN the app is built and the root page is rendered in a browser
- THEN CSS custom properties defined under `@theme` are present in the computed styles of root elements

#### Scenario: Tailwind utility classes resolve

- GIVEN a component uses a Tailwind utility class (e.g. `bg-primary`, `text-sm`)
- WHEN the page renders
- THEN the class resolves to the token value defined in the design system CSS

---

### Requirement: shadcn/ui Component Library

shadcn/ui MUST be initialized and all required components installed. Components (Button, Card, Input, Select, Textarea, Badge) MUST be available from `@/components/ui/`. Icons use `lucide-react` (shadcn dependency). Custom Angular atom implementations are NOT ported — shadcn equivalents replace them directly.

#### Scenario: shadcn/ui initialized

- GIVEN `npx shadcn@latest init` has been run with Tailwind v4 and the project's CSS variables
- WHEN `pnpm build` runs
- THEN no shadcn import errors are reported

#### Scenario: Button component renders with variant

- GIVEN the shadcn Button is rendered with `variant="default"` and `children="Submit"`
- WHEN the component mounts
- THEN a `<button>` element is visible with the correct Tailwind classes and text "Submit"

#### Scenario: Form components render without error

- GIVEN Input, Select, and Textarea shadcn components are rendered in isolation
- WHEN unit tests run via `pnpm test`
- THEN all render tests pass with no thrown errors

#### Scenario: Icon renders via lucide-react

- GIVEN a `lucide-react` icon (e.g. `<User />`) is rendered
- WHEN the component mounts
- THEN an SVG element is visible in the DOM

---

### Requirement: Vitest + RTL Test Harness

`pnpm test` MUST run Vitest with React Testing Library configured. All existing tests MUST pass. The harness MUST support JSX, TypeScript, and CSS module resolution.

#### Scenario: Test command executes successfully

- GIVEN Vitest and `@testing-library/react` are installed and configured
- WHEN `pnpm test` is executed
- THEN Vitest runs and reports results without configuration errors

#### Scenario: Atom unit test passes

- GIVEN a `Button.test.tsx` that renders Button and asserts text content
- WHEN `pnpm test` runs
- THEN the test passes and no import errors occur

---

### Requirement: CI Smoke Build

The GitHub Actions CI pipeline MUST run lint, typecheck, test, and build in sequence. All steps MUST pass on a clean checkout of the scaffold branch.

#### Scenario: CI pipeline passes on scaffold

- GIVEN the scaffold branch is pushed to GitHub
- WHEN the CI workflow triggers
- THEN lint (`pnpm lint`), typecheck (`tsc --noEmit`), test (`pnpm test`), and build (`pnpm build`) all exit with code 0
- AND the CI workflow status is green

---

### Requirement: Docker Next.js Node Server

The Docker image MUST run Next.js as a Node.js server (`next start`) on port 3000. Stage 2 base image is `node:24-bookworm-slim` — no nginx. middleware.ts MUST execute on every request in the containerized server.

#### Scenario: Docker image builds

- GIVEN the Dockerfile 2-stage build (builder → node runner) is implemented
- WHEN `docker build` is executed
- THEN the image builds without errors and the runner stage starts `next start`

#### Scenario: Protected route redirects unauthenticated request

- GIVEN the Docker container is running and no auth cookie is present
- WHEN an HTTP GET request is made to `/` (a protected route)
- THEN the response is a redirect to `/login` (middleware ran and enforced the guard)

#### Scenario: Static assets are served

- GIVEN the Docker container is running
- WHEN an HTTP GET request is made to a known static asset path (e.g. `/_next/static/...`)
- THEN the response status is 200 and the asset is returned with correct Content-Type

---

### Requirement: middleware.ts Route Guard Active in Production

Next.js `middleware.ts` MUST run on every request (protected and public) in the production container. The cookie-presence gate MUST redirect unauthenticated users before the page renders.

#### Scenario: middleware redirects on missing auth cookie

- GIVEN the server is running and the request has no refresh/hint cookie
- WHEN `GET /` is requested (a protected route)
- THEN the response is a 307/308 redirect to `/login?returnUrl=%2F`

#### Scenario: middleware allows public routes without cookie

- GIVEN the server is running and the request has no cookie
- WHEN `GET /login` is requested
- THEN the response is 200 (no redirect)
