import { createOpenAI } from "@ai-sdk/openai";
import type { Env } from "../env";

export function getLanguageModel(modelId: string, env: Env) {
  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  return openai(modelId);
}
