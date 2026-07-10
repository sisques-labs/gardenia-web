# Gardenia Web

Frontend for Gardenia — a gardening companion that keeps your green spaces
organized, shared, and easy to look after. Next.js 16 (App Router) on React
19, DDD + Hexagonal architecture, TanStack Query + Apollo Client + Zustand
for state, and a built-in server-side proxy for the REST/GraphQL API so the
browser only ever talks to this container.

## Quick start

```bash
docker run -p 3000:3000 \
  -e INTERNAL_API_URL=http://gardenia-api:3000 \
  sisqueslabs/gardenia-web:latest
```

The container needs a reachable Gardenia API instance — it does not bundle
one. `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_GRAPHQL_URL` are embedded at build
time (baked into the image), so they must point at URLs the **browser** can
reach; `INTERNAL_API_URL` is read at runtime and only used server-side, to
proxy `/api/*` and `/graphql` requests to the API container.

## Ports

| Port | Purpose |
|------|---------|
| `3000` | HTTP — app pages, `/api/*` and `/graphql` proxy routes |

## Routes

| Path | Purpose |
|------|---------|
| `GET /` | Redirects to `/{locale}/home` (authenticated) or `/{locale}/login` |
| `ANY /api/*` | Server-side proxy to the Gardenia API's `/api/*` (uses `INTERNAL_API_URL`) |
| `ANY /graphql` | Server-side proxy to the Gardenia API's `/graphql` (uses `INTERNAL_API_URL`) |

## Environment variables

| Variable | Default | Required | Notes |
|----------|---------|----------|-------|
| `PORT` | `3000` | No | HTTP port |
| `NODE_ENV` | `production` | No | |
| `NEXT_PUBLIC_API_URL` | `/api` | No | **Build-time** REST API base URL exposed to the browser; rebuild the image to change it |
| `NEXT_PUBLIC_GRAPHQL_URL` | `/graphql` | No | **Build-time** GraphQL endpoint exposed to the browser; rebuild the image to change it |
| `INTERNAL_API_URL` | `http://localhost:3000` | Yes (in multi-container setups) | **Runtime** origin of the Gardenia API, used server-side by the `/api` and `/graphql` proxy routes |

## Tags

- `latest` — most recent stable release (`main` branch)
- `x.y.z` — specific stable release
- `x.y.z-alpha.n` / `-beta.n` / `-rc.n` — prereleases from `develop`/`staging`

## Source

https://github.com/sisques-labs/gardenia-web
