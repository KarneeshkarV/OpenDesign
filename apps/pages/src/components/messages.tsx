import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

type MessagesProps = {
  messages: ChatMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
};

export function Messages({ messages, status }: MessagesProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-center font-semibold text-2xl tracking-tight text-foreground md:text-3xl">
            What can I help with?
          </h1>
          <p className="text-center text-sm text-muted-foreground/80">
            Ask anything. Try "generate a moody poster for a jazz cafe."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:gap-7">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {status === "submitted" && <PendingBubble />}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex w-fit max-w-[min(85%,56ch)] flex-col gap-1 rounded-2xl rounded-br-md border border-border/40 bg-secondary px-3.5 py-2 text-[13px] leading-[1.65] text-secondary-foreground">
          {message.parts.map((part, index) => (
            <MessagePart key={index} part={part} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-3">
      <div className="flex h-[calc(13px*1.65)] shrink-0 items-center">
        <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
          <Sparkles className="size-3.5" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-[13px] leading-[1.65] text-foreground">
        {message.parts.map((part, index) => (
          <MessagePart key={index} part={part} />
        ))}
      </div>
    </div>
  );
}

function PendingBubble() {
  return (
    <div className="flex w-full gap-3">
      <div className="flex h-[calc(13px*1.65)] shrink-0 items-center">
        <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
          <Sparkles className="size-3.5" />
        </div>
      </div>
      <div className="flex items-center gap-1 pt-2">
        <Dot delay="0s" />
        <Dot delay="0.15s" />
        <Dot delay="0.3s" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-1.5 rounded-full bg-muted-foreground/70"
      style={{ animation: `pulse-dot 1.1s infinite ease-in-out`, animationDelay: delay }}
    />
  );
}

function MessagePart({ part }: { part: ChatMessage["parts"][number] }) {
  if (part.type === "text") {
    return <div className="whitespace-pre-wrap break-words">{(part as { text: string }).text}</div>;
  }

  if (part.type === "step-start") {
    return null;
  }

  if (part.type === "tool-image_generation") {
    return <ImageGenerationPart part={part} />;
  }

  if (part.type.startsWith("tool-")) {
    const toolName = part.type.slice("tool-".length);
    const state = "state" in part ? (part as { state: string }).state : "unknown";
    const input = "input" in part ? (part as { input: unknown }).input : undefined;
    const output = "output" in part ? (part as { output: unknown }).output : undefined;
    const errorText =
      "errorText" in part ? (part as { errorText: string }).errorText : undefined;

    return (
      <div className="rounded-lg border border-border/40 bg-muted/40 px-3 py-2 text-[12px]">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="font-medium text-foreground">{toolName}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {state}
          </span>
        </div>
        {input !== undefined && (
          <ToolBlock label="input" value={input} />
        )}
        {output !== undefined && (
          <ToolBlock label="output" value={output} />
        )}
        {errorText && (
          <pre className="mt-1.5 overflow-x-auto rounded-md bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive">
            <span className="mb-0.5 block text-[9px] uppercase tracking-wider opacity-70">
              error
            </span>
            {errorText}
          </pre>
        )}
      </div>
    );
  }

  if (part.type === "reasoning" && "text" in part) {
    return (
      <div className="italic text-muted-foreground">
        {(part as { text: string }).text}
      </div>
    );
  }

  return <div className="text-xs text-muted-foreground/70">[{part.type}]</div>;
}

function ImageGenerationPart({
  part
}: {
  part: Extract<ChatMessage["parts"][number], { type: "tool-image_generation" }>;
}) {
  const imageSrc = getImageGenerationSrc(part.output);

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/30">
      <div className="flex items-center justify-between gap-3 border-border/50 border-b px-3 py-2">
        <span className="font-medium text-foreground text-xs">
          GPT image generation
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {part.state}
        </span>
      </div>

      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Generated by GPT image generation"
          className="max-h-[70vh] w-full bg-background object-contain"
        />
      ) : part.errorText ? (
        <div className="px-3 py-2 text-destructive text-xs">
          {part.errorText}
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-background/50 text-muted-foreground text-xs">
          Generating image...
        </div>
      )}
    </div>
  );
}

function getImageGenerationSrc(output: unknown) {
  if (!isRecord(output) || typeof output.result !== "string") return null;
  if (output.result.startsWith("data:")) return output.result;
  return `data:image/png;base64,${output.result}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function ToolBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <pre
      className={cn(
        "mt-1.5 overflow-x-auto rounded-md bg-background/60 px-2 py-1.5 text-[11px] text-foreground/80"
      )}
    >
      <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
