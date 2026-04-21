export const DEFAULT_CHAT_MODEL = "gpt-5-mini";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "gpt-5-mini",
    name: "GPT-5 mini",
    provider: "openai",
    description: "Fast, low-cost GPT-5 with tool use"
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "openai",
    description: "Flagship GPT-5 with tool use and vision"
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 mini",
    provider: "openai",
    description: "Fast GPT-4.1 with tool use"
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "Higher-quality GPT-4.1 with tool use"
  }
];

export const allowedModelIds = new Set(chatModels.map((m) => m.id));
