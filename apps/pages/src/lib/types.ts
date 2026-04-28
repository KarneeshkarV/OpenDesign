import type { UIMessage } from "ai";

export type MessageMetadata = {
  createdAt: string;
};

// Wire contract — must match apps/sandbox-agent/src/lib/events.ts
export type SandboxStatus =
  | "idle"
  | "booting"
  | "ready"
  | "running"
  | "done"
  | "error";

export type SandboxEvent =
  | { type: "status"; status: SandboxStatus; sandboxId?: string }
  | { type: "pi.thinking"; text: string }
  | { type: "pi.file_write"; path: string; bytes: number }
  | { type: "pi.command"; cmd: string }
  | { type: "pi.stdout"; line: string }
  | { type: "pi.stderr"; line: string }
  | { type: "pi.done"; summary: string; files: string[] }
  | { type: "pi.error"; message: string };

export type ChatTools = {
  image_generation: {
    input: {
      prompt: string;
      size?: "auto" | "1024x1024" | "1024x1536" | "1536x1024";
      quality?: "auto" | "low" | "medium" | "high";
      background?: "auto" | "opaque" | "transparent";
    };
    output: {
      result: string;
      revisedPrompt?: string;
    };
  };
  delegate_to_sandbox: {
    input: { instruction: string };
    output: {
      status: SandboxStatus;
      sandboxId?: string;
      lastEvent?: SandboxEvent;
    };
  };
};

export type ChatDataParts = {
  sandbox: SandboxEvent;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  ChatDataParts,
  ChatTools
>;

export type ChatModelOption = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModelOption[] = [
  {
    id: "gpt-5",
    name: "GPT-5",
    description: "Flagship GPT-5 with image generation"
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 mini",
    description: "Fast, low-cost GPT-5 for text-first chats"
  }
];

export const DEFAULT_CHAT_MODEL = chatModels[0].id;
