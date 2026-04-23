import type { UIMessage } from "ai";
import type {
  ImageGenerationInput,
  ImageGenerationOutput
} from "./ai/tools/image-generation";

export type MessageMetadata = {
  createdAt: string;
};

export type ChatTools = {
  image_generation: {
    input: ImageGenerationInput;
    output: ImageGenerationOutput;
  };
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  Record<string, never>,
  ChatTools
>;
