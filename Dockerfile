# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS builder
ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_GRAPHQL_URL=/graphql
ARG INTERNAL_API_URL=http://api:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
RUN pnpm build

FROM node:24-bookworm-slim AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
