import { ArrowUp, Square } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { chatModels } from "@/lib/types";

type MessageInputProps = {
  status: "submitted" | "streaming" | "ready" | "error";
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  autoFocus?: boolean;
};

export function MessageInput({
  status,
  selectedModelId,
  onModelChange,
  onSend,
  onStop,
  autoFocus = false
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isStreaming = status === "streaming";
  const isSubmitting = status === "submitted";
  const isBusy = isStreaming || isSubmitting;

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isBusy) return;
    onSend(trimmed);
    setValue("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-border/60 bg-card/40 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_32px_-12px_rgba(0,0,0,0.5)] focus-within:border-border"
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isBusy ? "Generating..." : "Send a message"}
        disabled={isSubmitting}
        rows={1}
        className="min-h-12 border-0 bg-transparent px-2 py-2 shadow-none focus-visible:border-0 focus-visible:ring-0"
      />

      <div className="flex items-center justify-between gap-2 px-1 pt-1">
        <Select
          value={selectedModelId}
          onValueChange={onModelChange}
          disabled={isBusy}
        >
          <SelectTrigger className="h-7 gap-1 px-2 text-[11px] leading-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {chatModels.map((model) => (
              <SelectItem
                key={model.id}
                value={model.id}
                className="items-start py-2"
              >
                <div className="flex flex-col gap-0.5">
                  <SelectItemText>
                    <span className="text-sm text-foreground">{model.name}</span>
                  </SelectItemText>
                  <span className="text-[11px] text-muted-foreground">
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isStreaming ? (
          <Button
            type="button"
            size="icon-sm"
            variant="default"
            onClick={() => onStop()}
            className="size-8 rounded-full"
            aria-label="Stop"
          >
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon-sm"
            variant="default"
            disabled={isSubmitting || value.trim().length === 0}
            className="size-8 rounded-full"
            aria-label="Send"
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
