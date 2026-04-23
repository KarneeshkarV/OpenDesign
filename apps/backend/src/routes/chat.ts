import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText
} from "ai";
import { z } from "zod";
import {
  DEFAULT_CHAT_MODEL,
  allowedModelIds
} from "../lib/ai/models";
import { systemPrompt } from "../lib/ai/prompts";
import { getLanguageModel } from "../lib/ai/providers";
import { getImageGenerationTool } from "../lib/ai/tools/image-generation";
import { getAuthSession } from "../lib/auth";
import { corsHeaders, jsonResponse } from "../lib/cors";
import type { Env } from "../lib/env";
import type { ChatMessage } from "../lib/types";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(4000)
});

const userMessageSchema = z.object({
  id: z.string(),
  role: z.literal("user"),
  parts: z.array(textPartSchema)
});

const postRequestBodySchema = z.object({
  id: z.string(),
  message: userMessageSchema.optional(),
  messages: z.array(z.record(z.string(), z.unknown())).optional(),
  selectedChatModel: z.string()
});

export async function handleChat(
  request: Request,
  env: Env
): Promise<Response> {
  const session = await getAuthSession(request, env);

  if (!session?.session || !session.user) {
    return jsonResponse(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse(
      { error: "OPENAI_API_KEY is not configured on the worker." },
      { status: 500 }
    );
  }

  let body: z.infer<typeof postRequestBodySchema>;
  try {
    body = postRequestBodySchema.parse(await request.json());
  } catch (error) {
    return jsonResponse(
      {
        error: "Invalid request body",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 400 }
    );
  }

  const chatModel = allowedModelIds.has(body.selectedChatModel)
    ? body.selectedChatModel
    : DEFAULT_CHAT_MODEL;

  let uiMessages: ChatMessage[];
  if (body.messages && body.messages.length > 0) {
    uiMessages = body.messages as unknown as ChatMessage[];
  } else if (body.message) {
    uiMessages = [body.message as unknown as ChatMessage];
  } else {
    return jsonResponse(
      { error: "Either `message` or `messages` must be provided." },
      { status: 400 }
    );
  }

  const modelMessages = await convertToModelMessages(uiMessages);

  const stream = createUIMessageStream<ChatMessage>({
    execute: async ({ writer: dataStream }) => {
      const result = streamText({
        model: getLanguageModel(chatModel, env),
        system: systemPrompt(),
        messages: modelMessages,
        tools: {
          image_generation: getImageGenerationTool(env)
        }
      });

      dataStream.merge(result.toUIMessageStream());
    },
    onError: (error) => {
      console.error("chat stream error", error);
      return "Something went wrong generating a response.";
    }
  });

  return createUIMessageStreamResponse({
    stream,
    headers: corsHeaders
  });
}
