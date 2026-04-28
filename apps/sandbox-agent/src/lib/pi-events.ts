import type { SandboxEvent } from "./events";

type PiRawEvent = {
  type?: string;
  [key: string]: unknown;
};

export function parsePiLine(line: string): SandboxEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  let raw: PiRawEvent;
  try {
    raw = JSON.parse(trimmed) as PiRawEvent;
  } catch {
    return { type: "pi.stdout", line: trimmed };
  }

  switch (raw.type) {
    case "thinking":
    case "assistant_text":
      return { type: "pi.thinking", text: String(raw.text ?? "") };
    case "file_write":
    case "write":
      return {
        type: "pi.file_write",
        path: String(raw.path ?? ""),
        bytes: Number(raw.bytes ?? 0)
      };
    case "command":
    case "bash":
      return { type: "pi.command", cmd: String(raw.cmd ?? raw.command ?? "") };
    case "stdout":
      return { type: "pi.stdout", line: String(raw.line ?? raw.text ?? "") };
    case "stderr":
      return { type: "pi.stderr", line: String(raw.line ?? raw.text ?? "") };
    case "done":
    case "finish":
      return {
        type: "pi.done",
        summary: String(raw.summary ?? ""),
        files: Array.isArray(raw.files) ? raw.files.map(String) : []
      };
    case "error":
      return { type: "pi.error", message: String(raw.message ?? raw.error ?? "error") };
    default:
      return { type: "pi.stdout", line: trimmed };
  }
}

export function createLineSplitter(onLine: (line: string) => void) {
  let buffer = "";
  return (chunk: string) => {
    buffer += chunk;
    let idx = buffer.indexOf("\n");
    while (idx !== -1) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      onLine(line);
      idx = buffer.indexOf("\n");
    }
  };
}
