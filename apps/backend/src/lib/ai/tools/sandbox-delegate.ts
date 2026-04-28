import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { createClient } from "rivetkit/client";
import type { Registry } from "@opendesign/sandbox-agent/registry";
import type { SandboxEvent, SandboxStatus } from "@opendesign/sandbox-agent/events";
import type { Env } from "../../env";
import { ensureWebSocketAcceptsHttpScheme } from "../../rivet-ws-patch";
import type { ChatMessage } from "../../types";

export type SandboxDelegateInput = {
  instruction: string;
};

export type SandboxDelegateOutput = {
  status: SandboxStatus;
  sandboxId?: string;
  lastEvent?: SandboxEvent;
};

export type SandboxDelegateDeps = {
  env: Env;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  chatId: string;
};

export function getSandboxDelegateTool(deps: SandboxDelegateDeps) {
  const { env, dataStream, chatId } = deps;

  return tool({
    description:
      "Delegate a coding task to the sandbox agent. The sandbox agent runs an isolated dev environment (E2B) with an AI coding harness (Pi) that writes and executes code. Send ONLY a natural-language instruction describing what to build or run — never send code. The sandbox agent streams file writes, commands, and stdout/stderr back as they happen.",
    inputSchema: z.object({
      instruction: z
        .string()
        .min(1)
        .max(8000)
        .describe(
          "Natural-language instruction for the sandbox agent. Describe the task, language, any libraries, and expected behaviour. Do NOT write code here."
        )
    }),
    execute: async (input): Promise<SandboxDelegateOutput> => {
      ensureWebSocketAcceptsHttpScheme();
      const endpoint = env.RIVET_ENDPOINT ?? "http://localhost:6420";
      console.log(
        `[delegate_to_sandbox] → rivet=${endpoint} chat=${chatId} instr=${input.instruction.slice(0, 80)}`
      );
      const client = createClient<Registry>(endpoint);

      const handle = client.sandboxSession.getOrCreate([chatId]);
      const connection = handle.connect();

      let eventSeq = 0;
      let lastEvent: SandboxEvent | undefined;
      let finalStatus: SandboxStatus = "idle";
      let finalSandboxId: string | undefined;

      const unsubscribe = connection.on(
        "event",
        (event: SandboxEvent) => {
          lastEvent = event;
          if (event.type === "status") {
            finalStatus = event.status;
            if (event.sandboxId) finalSandboxId = event.sandboxId;
          }
          console.log(`[delegate_to_sandbox] ← event ${event.type}`);
          dataStream.write({
            type: "data-sandbox",
            id: `${chatId}:${eventSeq++}`,
            data: event
          });
        }
      );

      try {
        const result = await connection.run({ instruction: input.instruction });
        console.log(
          `[delegate_to_sandbox] ✓ run returned status=${result.status} sandbox=${result.sandboxId}`
        );
        finalStatus = result.status;
        if (result.sandboxId) finalSandboxId = result.sandboxId;
      } catch (err) {
        console.error(`[delegate_to_sandbox] ✗ run failed`, err);
        const message = err instanceof Error ? err.message : String(err);
        const errorEvent: SandboxEvent = { type: "pi.error", message };
        lastEvent = errorEvent;
        finalStatus = "error";
        dataStream.write({
          type: "data-sandbox",
          id: `${chatId}:${eventSeq++}`,
          data: errorEvent
        });
      } finally {
        if (typeof unsubscribe === "function") unsubscribe();
        try {
          await connection.dispose();
        } catch {
          // ignore
        }
      }

      return {
        status: finalStatus,
        sandboxId: finalSandboxId,
        lastEvent
      };
    }
  });
}
