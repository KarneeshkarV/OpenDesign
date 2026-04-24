import type { UIMessage } from "ai";
import type { SandboxEvent } from "@opendesign/sandbox-agent/events";
import type {
  ImageGenerationInput,
  ImageGenerationOutput
} from "./ai/tools/image-generation";
import type {
  SandboxDelegateInput,
  SandboxDelegateOutput
} from "./ai/tools/sandbox-delegate";

export type MessageMetadata = {
  createdAt: string;
};

export type ChatTools = {
  image_generation: {
    input: ImageGenerationInput;
    output: ImageGenerationOutput;
  };
  delegate_to_sandbox: {
    input: SandboxDelegateInput;
    output: SandboxDelegateOutput;
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
