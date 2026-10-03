import { EventEmitter } from "node:events";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { platform } from "node:os";
import { PROJECT_DIR } from "../utils/paths";

interface ActiveSession {
  process: ChildProcessWithoutNullStreams;
}

/**
 * Spawns and manages interactive shell processes per session.
 *
 * DO NOT MODIFY — students consume this via services only.
 *
 * Events:
 * - output(sessionId, content: string)
 * - exit(sessionId, code: number)
 * - error(sessionId, error: Error)
 */
export class TerminalRunner extends EventEmitter {
  private readonly sessions = new Map<string, ActiveSession>();

  private resolveShell(): { command: string; args: string[] } {
    if (platform() === "win32") {
      return { command: "powershell.exe", args: ["-NoLogo"] };
    }

    return {
      command: process.env.SHELL ?? "/bin/sh",
      args: [],
    };
  }

  start(sessionId: string): void {
    if (this.sessions.has(sessionId)) {
      return;
    }

    const { command, args } = this.resolveShell();

    const child = spawn(command, args, {
      cwd: PROJECT_DIR,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.sessions.set(sessionId, { process: child });

    child.stdout.on("data", (chunk: Buffer) => {
      this.emit("output", sessionId, chunk.toString());
    });

    child.stderr.on("data", (chunk: Buffer) => {
      this.emit("output", sessionId, chunk.toString());
    });

    child.on("exit", (code) => {
      this.sessions.delete(sessionId);
      this.emit("exit", sessionId, code ?? 0);
    });

    child.on("error", (error) => {
      this.sessions.delete(sessionId);
      this.emit("error", sessionId, error);
    });
  }

  send(sessionId: string, command: string): void {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`No active terminal for session: ${sessionId}`);
    }

    session.process.stdin.write(`${command}\n`);
  }

  stop(sessionId: string): void {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    session.process.kill();
    this.sessions.delete(sessionId);
  }
}

export const terminalRunner = new TerminalRunner();
