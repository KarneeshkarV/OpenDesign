import type { UIMessage } from "ai";

export type MessageMetadata = {
  createdAt: string;
};

export type ChatMessage = UIMessage<MessageMetadata>;

export type ChatModelOption = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModelOption[] = [
  {
    id: "gpt-5-mini",
    name: "GPT-5 mini",
    description: "Fast, low-cost GPT-5 with tool use"
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    description: "Flagship GPT-5 with tool use and vision"
  }
];

export const DEFAULT_CHAT_MODEL = chatModels[0].id;
