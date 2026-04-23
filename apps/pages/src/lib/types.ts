import type { UIMessage } from "ai";

export type MessageMetadata = {
  createdAt: string;
};

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
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  Record<string, never>,
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
