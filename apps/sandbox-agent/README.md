# @opendesign/sandbox-agent

Rivet actor service that owns E2B sandboxes + Pi (`@mariozechner/pi-coding-agent`)
for the main agent to delegate coding work to. The main agent sends only
natural-language *instructions*; this service spawns Pi inside an E2B sandbox
and streams Pi's events back to the caller.

## Prereqs

- Rivet engine running locally:

  ```bash
  docker run -d \
    --name rivet-engine \
    -p 6420:6420 \
    -v rivet-data:/data \
    -e RIVET__FILE_SYSTEM__PATH=/data \
    rivetdev/engine:latest
  ```

- E2B API key (`E2B_API_KEY`) and an OpenAI key for Pi (`OPENAI_API_KEY`).

## Setup

```bash
cp .env.example .env
# fill in E2B_API_KEY, OPENAI_API_KEY
bun install
bun run dev
```

The actor server listens on `:6430` by default and connects to the Rivet
engine at `RIVET_ENDPOINT`.

## Actor: `sandboxSession`

- **Key**: `chat.id` from the main agent — one actor (and one E2B sandbox) per
  chat session. Follow-up instructions in the same chat reuse the same
  sandbox.
- **Actions**
  - `run({ instruction })` — boot (or reuse) the sandbox, run Pi with the
    instruction, broadcast events.
  - `status()` — return current `{ status, sandboxId, lastInstruction,
    lastError }`.
  - `shutdown()` — kill the sandbox.
- **Events** (broadcast on topic `"event"`, typed as
  `SandboxEvent` from `./src/lib/events.ts`):
  - `status` — lifecycle: `booting → ready → running → done | error`.
  - `pi.thinking`, `pi.file_write`, `pi.command`, `pi.stdout`, `pi.stderr`,
    `pi.done`, `pi.error`.

## Design boundary

- This service runs **no LLM** itself. The only model call happens inside the
  sandbox via Pi. The actor is pure orchestration.
- The event schema in `src/lib/events.ts` is the wire contract with the main
  agent (`apps/backend`) — mirror changes on both sides.
