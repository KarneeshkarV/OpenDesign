import { Sandbox } from "@e2b/code-interpreter";
import type { SandboxEvent } from "./events";
import { createLineSplitter, parsePiLine } from "./pi-events";

export type E2bSessionConfig = {
  e2bApiKey: string;
  piLlmApiKey: string;
  piLlmProvider?: "openai" | "anthropic";
  piModel?: string;
};

const PI_PREFIX_EXPR = '${HOME:-/home/user}/.local/pi-coding-agent';
const PI_INSTALL_COMMAND = [
  `PI_PREFIX="${PI_PREFIX_EXPR}"`,
  'mkdir -p "$PI_PREFIX"',
  'npm install -g --no-fund --no-audit --prefix "$PI_PREFIX" @mariozechner/pi-coding-agent'
].join(" && ");

export class E2bSession {
  private sandbox: Sandbox | null = null;
  private piInstalled = false;
  private lastActivity = Date.now();

  constructor(private readonly config: E2bSessionConfig) {}

  async ensureReady(emit: (event: SandboxEvent) => void): Promise<Sandbox> {
    if (this.sandbox) {
      this.lastActivity = Date.now();
      return this.sandbox;
    }

    emit({ type: "status", status: "booting" });

    const sandbox = await Sandbox.create({ apiKey: this.config.e2bApiKey });
    this.sandbox = sandbox;
    const sandboxId = sandbox.sandboxId;

    if (!this.piInstalled) {
      emit({
        type: "pi.command",
        cmd: `bash -lc '${PI_INSTALL_COMMAND}'`
      });
      const stdoutChunks: string[] = [];
      const stderrChunks: string[] = [];
      try {
        const result = await sandbox.commands.run(`bash -lc '${PI_INSTALL_COMMAND}'`, {
          timeoutMs: 180_000,
          onStdout: (line: string) => {
            stdoutChunks.push(line);
            emit({ type: "pi.stdout", line });
          },
          onStderr: (line: string) => {
            stderrChunks.push(line);
            emit({ type: "pi.stderr", line });
          }
        });
        console.log(
          `[sandbox-agent] pi install exitCode=${result.exitCode} stdoutLen=${stdoutChunks.join("").length} stderrLen=${stderrChunks.join("").length}`
        );
        if (result.exitCode !== 0) {
          const tail = stderrChunks.join("").trim().slice(-1200) ||
            stdoutChunks.join("").trim().slice(-1200) ||
            "(no output)";
          throw new Error(
            `pi install failed (exit ${result.exitCode}): ${tail}`
          );
        }
      } catch (err) {
        const tail =
          stderrChunks.join("").trim().slice(-1200) ||
          stdoutChunks.join("").trim().slice(-1200);
        const baseMsg = err instanceof Error ? err.message : String(err);
        const combined = tail ? `${baseMsg}\n---stderr/stdout tail---\n${tail}` : baseMsg;
        console.error(`[sandbox-agent] pi install error: ${combined}`);
        throw new Error(combined);
      }
      this.piInstalled = true;
    }

    emit({ type: "status", status: "ready", sandboxId });
    this.lastActivity = Date.now();
    return sandbox;
  }

  async runPi(
    instruction: string,
    emit: (event: SandboxEvent) => void
  ): Promise<void> {
    let sandbox: Sandbox;
    try {
      sandbox = await this.ensureReady(emit);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      emit({ type: "pi.error", message });
      emit({ type: "status", status: "error" });
      this.lastActivity = Date.now();
      return;
    }
    emit({ type: "status", status: "running", sandboxId: sandbox.sandboxId });

    const providerEnvKey =
      this.config.piLlmProvider === "anthropic"
        ? "ANTHROPIC_API_KEY"
        : "OPENAI_API_KEY";
    const model = this.config.piModel ?? "gpt-5";

    const splitStdout = createLineSplitter((line) => {
      const evt = parsePiLine(line);
      if (evt) emit(evt);
    });
    const splitStderr = createLineSplitter((line) => {
      if (line.trim()) emit({ type: "pi.stderr", line });
    });
    const piRunCommand = [
      `PI_PREFIX="${PI_PREFIX_EXPR}"`,
      'export PATH="$PI_PREFIX/bin:$PATH"',
      'exec "$PI_PREFIX/bin/pi" -p "$PI_INSTRUCTION" --mode json --model "$PI_MODEL"'
    ].join("; ");

    try {
      emit({ type: "pi.command", cmd: `bash -lc '${piRunCommand}'` });
      const result = await sandbox.commands.run(`bash -lc '${piRunCommand}'`, {
        envs: {
          [providerEnvKey]: this.config.piLlmApiKey,
          PI_INSTRUCTION: instruction,
          PI_MODEL: model
        },
        timeoutMs: 600_000,
        onStdout: (data: string) => splitStdout(data),
        onStderr: (data: string) => splitStderr(data)
      });

      if (result.exitCode !== 0) {
        emit({
          type: "pi.error",
          message: `pi exited with code ${result.exitCode}`
        });
        emit({ type: "status", status: "error", sandboxId: sandbox.sandboxId });
        return;
      }

      emit({ type: "status", status: "done", sandboxId: sandbox.sandboxId });
    } catch (err) {
      emit({
        type: "pi.error",
        message: err instanceof Error ? err.message : String(err)
      });
      emit({ type: "status", status: "error", sandboxId: sandbox.sandboxId });
    } finally {
      this.lastActivity = Date.now();
    }
  }

  async shutdown(): Promise<void> {
    if (!this.sandbox) return;
    try {
      await this.sandbox.kill();
    } finally {
      this.sandbox = null;
      this.piInstalled = false;
    }
  }

  idleMs(): number {
    return Date.now() - this.lastActivity;
  }
}
