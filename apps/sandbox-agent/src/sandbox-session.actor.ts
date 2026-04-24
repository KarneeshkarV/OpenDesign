import { actor } from "rivetkit";
import { E2bSession } from "./lib/e2b-session";
import type { SandboxEvent, SandboxStatus } from "./lib/events";

type RunInput = {
  instruction: string;
};

// E2B sessions are kept in-memory keyed by the actor's stable id. They can't
// live in `state` because they hold a live socket to the sandbox.
const sessionByActorId = new Map<string, E2bSession>();

function getSession(actorId: string): E2bSession {
  let session = sessionByActorId.get(actorId);
  if (!session) {
    const e2bApiKey = process.env.E2B_API_KEY;
    const piLlmApiKey = process.env.OPENAI_API_KEY;
    if (!e2bApiKey) throw new Error("E2B_API_KEY is not set");
    if (!piLlmApiKey) throw new Error("OPENAI_API_KEY is not set");
    session = new E2bSession({
      e2bApiKey,
      piLlmApiKey,
      piLlmProvider: "openai",
      piModel: process.env.PI_MODEL ?? "gpt-5"
    });
    sessionByActorId.set(actorId, session);
  }
  return session;
}

export const sandboxSession = actor({
  state: {
    status: "idle" as SandboxStatus,
    sandboxId: undefined as string | undefined,
    lastInstruction: undefined as string | undefined,
    lastError: undefined as string | undefined
  },

  actions: {
    async run(c, input: RunInput): Promise<{ status: SandboxStatus; sandboxId?: string }> {
      const actorId = String((c as unknown as { id?: string }).id ?? "default");
      console.log(
        `[sandbox-agent] run() actor=${actorId} instr=${input.instruction.slice(0, 80)}`
      );
      const session = getSession(actorId);
      c.state.lastInstruction = input.instruction;

      const emit = (event: SandboxEvent) => {
        if (event.type === "status") {
          c.state.status = event.status;
          if (event.sandboxId) c.state.sandboxId = event.sandboxId;
        } else if (event.type === "pi.error") {
          c.state.lastError = event.message;
        }
        console.log(`[sandbox-agent] emit ${event.type}`);
        c.broadcast("event", event);
      };

      await session.runPi(input.instruction, emit);
      console.log(
        `[sandbox-agent] run() done status=${c.state.status} sandbox=${c.state.sandboxId}`
      );
      return { status: c.state.status, sandboxId: c.state.sandboxId };
    },

    status(c) {
      return { ...c.state };
    },

    async shutdown(c): Promise<void> {
      const actorId = String((c as unknown as { id?: string }).id ?? "default");
      const session = sessionByActorId.get(actorId);
      if (session) {
        await session.shutdown();
        sessionByActorId.delete(actorId);
      }
      c.state.status = "idle";
      c.state.sandboxId = undefined;
    }
  }
});
