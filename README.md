# OpenDesign

A `bun` + `turbo` monorepo with a Cloudflare Worker backend and a Cloudflare Pages frontend.

## Apps

- `apps/backend`: TypeScript Cloudflare Worker API
- `apps/pages`: React + Vite app configured for Cloudflare Pages

## Requirements

- Bun `1.3.5` or newer
- A Cloudflare account for deployment

## Install

```bash
bun install
```

## Local development

Run everything:

```bash
bun run dev
```

Run one app at a time:

```bash
bun run dev:backend
bun run dev:pages
```

Default local URLs:

- Pages app: `http://localhost:3000`
- Backend Worker: `http://127.0.0.1:8787`

The pages app now uses same-origin `/api/*` requests. During local development, Vite proxies `/api/*` to the backend Worker.

## Auth setup

Copy `apps/backend/.dev.vars.example` to `apps/backend/.dev.vars` and fill in:

- `OPENAI_API_KEY`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `BETTER_AUTH_API_KEY` if you want Better Auth Infrastructure enabled
- `BETTER_AUTH_TRUSTED_ORIGINS` if you need additional frontend origins such as ngrok during local development

The backend uses Better Auth with Neon PostgreSQL by default. The database integration is isolated behind the auth storage module in `apps/backend/src/lib/auth/database/`, so it can be swapped later without rewriting the auth routes.
For the current Cloudflare Worker setup, the Neon adapter uses request-scoped pools with fetch-based queries to avoid cross-request Worker I/O errors.

Create the Better Auth tables from `apps/backend`:

```bash
cd apps/backend
npx auth@latest migrate --config ./auth.ts
```

`apps/backend/auth.ts` automatically loads `apps/backend/.dev.vars` for local CLI usage, so you do not need to manually export those variables before running the migration.
The migration config intentionally skips Better Auth Infrastructure plugins, so schema generation does not depend on `BETTER_AUTH_API_KEY` or infra-specific runtime code.
If you access the frontend through a forwarded URL such as ngrok, add that origin to `BETTER_AUTH_TRUSTED_ORIGINS` as a comma-separated list.

For Cloudflare Pages deployments, set `BACKEND_API_ORIGIN` to your deployed Worker URL so the Pages Function proxy can forward `/api/*` requests to the backend.

## Build

```bash
bun run build
```

## Deploy

Authenticate first:

```bash
bunx wrangler login
```

Deploy each app:

```bash
bun --filter @opendesign/backend deploy
bun --filter @opendesign/pages deploy
```

Before your first deploy, review the project names in:

- `apps/backend/wrangler.jsonc`
- `apps/pages/wrangler.jsonc`

You can also run both deployment scripts through Turbo:

```bash
bun run deploy
```
