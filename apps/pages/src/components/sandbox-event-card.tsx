import { useMemo } from "react";
import type { SandboxEvent, SandboxStatus } from "@/lib/types";

type SandboxEventCardProps = {
  events: SandboxEvent[];
};

const DEVELOP_BLUE = "#0a72ef";
const BADGE_BG = "#ebf5ff";
const BADGE_TEXT = "#0068d6";

export function SandboxEventCard({ events }: SandboxEventCardProps) {
  const { status, sandboxId } = useMemo(() => deriveState(events), [events]);

  return (
    <div
      className="overflow-hidden rounded-lg bg-card"
      style={{
        boxShadow:
          "rgba(255,255,255,0.08) 0 0 0 1px, rgba(0,0,0,0.40) 0 2px 2px, rgba(255,255,255,0.02) 0 0 0 1px inset"
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5"
        style={{
          boxShadow: "rgba(255,255,255,0.06) 0 1px 0 0 inset",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            Sandbox
          </span>
          {sandboxId && (
            <span
              className="font-mono text-[11px] text-muted-foreground/70"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {sandboxId.slice(0, 8)}
            </span>
          )}
        </div>
        <StatusPill status={status} />
      </div>

      <ol className="flex flex-col">
        {events.map((event, index) => (
          <li
            key={index}
            className="px-4 py-2"
            style={{
              borderTop:
                index === 0 ? "none" : "1px solid rgba(255,255,255,0.04)"
            }}
          >
            <EventRow event={event} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function StatusPill({ status }: { status: SandboxStatus }) {
  const styles = statusStyles(status);
  return (
    <span
      className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]"
      style={styles}
    >
      {status}
    </span>
  );
}

function statusStyles(status: SandboxStatus): React.CSSProperties {
  switch (status) {
    case "booting":
    case "running":
      return { background: BADGE_BG, color: BADGE_TEXT };
    case "ready":
      return {
        background: "rgba(10,114,239,0.12)",
        color: DEVELOP_BLUE
      };
    case "done":
      return {
        background: "rgba(255,255,255,0.06)",
        color: "rgba(237,237,237,0.9)"
      };
    case "error":
      return { background: "rgba(255,91,79,0.14)", color: "#ff5b4f" };
    default:
      return {
        background: "rgba(255,255,255,0.04)",
        color: "rgba(237,237,237,0.55)"
      };
  }
}

function EventRow({ event }: { event: SandboxEvent }) {
  switch (event.type) {
    case "status":
      return (
        <Row
          label="status"
          body={
            event.sandboxId
              ? `${event.status} · ${event.sandboxId.slice(0, 8)}`
              : event.status
          }
        />
      );
    case "pi.thinking":
      return <Row label="thinking" body={event.text} italic />;
    case "pi.file_write":
      return (
        <Row
          label="write"
          body={
            <>
              <span className="font-mono">{event.path}</span>
              {event.bytes > 0 && (
                <span className="ml-2 text-muted-foreground/60">
                  {event.bytes} B
                </span>
              )}
            </>
          }
        />
      );
    case "pi.command":
      return (
        <div className="flex flex-col gap-1.5">
          <RowLabel label="run" />
          <Pre>{`$ ${event.cmd}`}</Pre>
        </div>
      );
    case "pi.stdout":
      return (
        <div className="flex flex-col gap-1.5">
          <RowLabel label="stdout" />
          <Pre>{event.line}</Pre>
        </div>
      );
    case "pi.stderr":
      return (
        <div className="flex flex-col gap-1.5">
          <RowLabel label="stderr" tone="warn" />
          <Pre tone="warn">{event.line}</Pre>
        </div>
      );
    case "pi.done":
      return (
        <div className="flex flex-col gap-1">
          <Row label="done" body={event.summary || "Task complete"} />
          {event.files.length > 0 && (
            <div className="pl-12 font-mono text-[11px] text-muted-foreground/70">
              {event.files.join(", ")}
            </div>
          )}
        </div>
      );
    case "pi.error":
      return <Row label="error" body={event.message} tone="error" />;
  }
}

function Row({
  label,
  body,
  tone,
  italic
}: {
  label: string;
  body: React.ReactNode;
  tone?: "warn" | "error";
  italic?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <RowLabel label={label} tone={tone} />
      <div
        className={`flex-1 text-[13px] leading-[1.65] ${
          italic ? "italic text-muted-foreground" : "text-foreground/85"
        }`}
      >
        {body}
      </div>
    </div>
  );
}

function RowLabel({
  label,
  tone
}: {
  label: string;
  tone?: "warn" | "error";
}) {
  const color =
    tone === "error"
      ? "#ff5b4f"
      : tone === "warn"
      ? "#eab308"
      : "rgba(237,237,237,0.55)";
  return (
    <span
      className="w-16 shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.08em]"
      style={{ color, fontVariantNumeric: "tabular-nums" }}
    >
      {label}
    </span>
  );
}

function Pre({
  children,
  tone
}: {
  children: React.ReactNode;
  tone?: "warn";
}) {
  return (
    <pre
      className="overflow-x-auto rounded-md px-3 py-2 font-mono text-[12px] leading-[1.55] text-foreground/85"
      style={{
        background: "rgba(255,255,255,0.025)",
        boxShadow: "rgba(255,255,255,0.06) 0 0 0 1px",
        color: tone === "warn" ? "#f0b47a" : undefined,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
      }}
    >
      {children}
    </pre>
  );
}

function deriveState(events: SandboxEvent[]): {
  status: SandboxStatus;
  sandboxId?: string;
} {
  let status: SandboxStatus = "idle";
  let sandboxId: string | undefined;
  for (const event of events) {
    if (event.type === "status") {
      status = event.status;
      if (event.sandboxId) sandboxId = event.sandboxId;
    } else if (event.type === "pi.error") {
      status = "error";
    } else if (event.type === "pi.done") {
      status = "done";
    }
  }
  return { status, sandboxId };
}
