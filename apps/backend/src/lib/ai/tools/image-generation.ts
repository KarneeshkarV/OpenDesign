import { tool } from "ai";
import { z } from "zod";
import type { Env } from "../../env";

export type ImageGenerationInput = {
  prompt: string;
  size?: "auto" | "1024x1024" | "1024x1536" | "1536x1024";
  quality?: "auto" | "low" | "medium" | "high";
  background?: "auto" | "opaque" | "transparent";
};

export type ImageGenerationOutput = {
  result: string;
  revisedPrompt?: string;
};

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
    revised_prompt?: string;
  }>;
  error?: {
    message?: string;
  };
};

export function getImageGenerationTool(env: Env) {
  return tool({
    description:
      "Generate a new image from a text prompt using GPT Image. Use this when the user asks to create, generate, draw, render, or make an image.",
    inputSchema: z.object({
      prompt: z
        .string()
        .min(1)
        .max(32000)
        .describe("Detailed prompt for the image to generate."),
      size: z
        .enum(["auto", "1024x1024", "1024x1536", "1536x1024"])
        .optional()
        .describe("Image size. Use auto unless the user requests an orientation."),
      quality: z
        .enum(["auto", "low", "medium", "high"])
        .optional()
        .describe("Image quality. Use auto unless the user asks for a quality level."),
      background: z
        .enum(["auto", "opaque", "transparent"])
        .optional()
        .describe("Background style. Use transparent only if the user asks for it.")
    }),
    execute: async (input): Promise<ImageGenerationOutput> => {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: input.prompt,
          size: input.size ?? "auto",
          quality: input.quality ?? "auto",
          background: input.background ?? "auto"
        })
      });

      const data = (await response.json()) as OpenAIImageResponse;

      if (!response.ok) {
        throw new Error(data.error?.message ?? "Image generation failed.");
      }

      const image = data.data?.[0];
      if (!image?.b64_json) {
        throw new Error("Image generation returned no image data.");
      }

      return {
        result: image.b64_json,
        revisedPrompt: image.revised_prompt
      };
    }
  });
}
