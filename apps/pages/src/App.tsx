import { useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { cn } from "@/lib/utils";

type HealthResponse = {
  service: string;
  status: string;
  timestamp: string;
};

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8787";

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/health`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;
        setHealth(data);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      }
    };

    void load();

    return () => controller.abort();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur">
        <span className="text-[13px] font-semibold tracking-tight">
          OpenDesign
        </span>
        <div
          className="flex items-center gap-2 text-[11px] text-muted-foreground"
          title={
            health
              ? `backend ok · ${new Date(health.timestamp).toLocaleTimeString()}`
              : error
                ? `backend unavailable: ${error}`
                : "checking backend..."
          }
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              health
                ? "bg-emerald-400"
                : error
                  ? "bg-destructive"
                  : "bg-muted-foreground/60"
            )}
          />
          <span className="hidden sm:inline">
            {health ? "online" : error ? "offline" : "connecting"}
          </span>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <Chat />
      </main>
    </div>
  );
}
