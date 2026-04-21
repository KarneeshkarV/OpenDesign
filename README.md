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

The pages app reads `VITE_API_BASE_URL` and falls back to `http://127.0.0.1:8787`.

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
