export type SandboxStatus =
  | "idle"
  | "booting"
  | "ready"
  | "running"
  | "done"
  | "error";

export type SandboxEvent =
  | { type: "status"; status: SandboxStatus; sandboxId?: string }
  | { type: "pi.thinking"; text: string }
  | { type: "pi.file_write"; path: string; bytes: number }
  | { type: "pi.command"; cmd: string }
  | { type: "pi.stdout"; line: string }
  | { type: "pi.stderr"; line: string }
  | { type: "pi.done"; summary: string; files: string[] }
  | { type: "pi.error"; message: string };
