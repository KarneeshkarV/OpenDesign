import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef, useState } from "react";
import { DEFAULT_CHAT_MODEL, type ChatMessage } from "@/lib/types";
import { MessageInput } from "./message-input";
import { Messages } from "./messages";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8787";

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function Chat() {
  const chatId = useMemo(() => generateId(), []);
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_CHAT_MODEL);
  const selectedModelIdRef = useRef(selectedModelId);
  selectedModelIdRef.current = selectedModelId;

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${apiBaseUrl}/api/chat`,
        prepareSendMessagesRequest({ id, messages, body }) {
          return {
            body: {
              id,
              message: messages.at(-1),
              selectedChatModel: selectedModelIdRef.current,
              ...body
            }
          };
        }
      }),
    []
  );

  const { messages, sendMessage, status, stop } = useChat<ChatMessage>({
    id: chatId,
    generateId,
    transport,
    onError: (error) => {
      setErrorBanner(error.message ?? "Unknown error");
    }
  });

  const handleSend = (text: string) => {
    setErrorBanner(null);
    sendMessage({
      role: "user",
      parts: [{ type: "text", text }]
    });
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Messages messages={messages} status={status} />
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        {errorBanner && (
          <div
            role="alert"
            className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {errorBanner}
          </div>
        )}
        <MessageInput
          status={status}
          selectedModelId={selectedModelId}
          onModelChange={setSelectedModelId}
          onSend={handleSend}
          onStop={stop}
          autoFocus={isEmpty}
        />
      </div>
    </div>
  );
}
