import type { InferUITool, UIMessage } from "ai";
import type { getWeather } from "./ai/tools/get-weather";

export type MessageMetadata = {
  createdAt: string;
};

export type ChatTools = {
  getWeather: InferUITool<typeof getWeather>;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  Record<string, never>,
  ChatTools
>;
