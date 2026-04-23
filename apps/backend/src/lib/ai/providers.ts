import { createOpenAI } from "@ai-sdk/openai";
import type { Env } from "../env";

export function getOpenAIProvider(env: Env) {
  return createOpenAI({ apiKey: env.OPENAI_API_KEY });
}

export function getLanguageModel(modelId: string, env: Env) {
  const openai = getOpenAIProvider(env);
  return openai.responses(modelId);
}
