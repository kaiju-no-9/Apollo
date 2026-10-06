import { EventEmitter } from "node:events";
import { messageRepository } from "../repositories/message.repository";
import { sessionRepository } from "../repositories/session.repository";
import { terminalRunner } from "../lib/terminalRunner";

export class TerminalService {
  private readonly pendingWrites = new Map<string, Promise<void>>();
  private readonly events = new EventEmitter();
  private readonly closedSessions = new Set<string>();

  constructor() {
    terminalRunner.on("output", (sessionId: string, content: string) => {
      this.events.emit("output", sessionId, content);
      this.persistOutput(sessionId, content);
    });

    terminalRunner.on("exit", (sessionId: string) => {
      void this.handleRunnerEnd(sessionId).catch((error: unknown) => {
        console.error(`Could not finalize terminal session ${sessionId}:`, error);
      });
    });

    terminalRunner.on("error", (sessionId: string, error: Error) => {
      console.error(`Terminal process failed for session ${sessionId}:`, error);
      void this.handleRunnerEnd(sessionId).catch((handlerError: unknown) => {
        console.error(`Could not finalize terminal session ${sessionId}:`, handlerError);
      });
    });
  }

  async startTerminal(sessionId: string): Promise<void> {
    this.closedSessions.delete(sessionId);
    terminalRunner.start(sessionId);
  }

  async sendCommand(sessionId: string, command: string): Promise<void> {
    await messageRepository.create(sessionId, "input", command);
    terminalRunner.send(sessionId, command);
  }

  async stopTerminal(sessionId: string): Promise<void> {
    terminalRunner.stop(sessionId);
    await this.flushWrites(sessionId);
  }

  onOutput(listener: (sessionId: string, content: string) => void): () => void {
    this.events.on("output", listener);
    return () => this.events.off("output", listener);
  }

  onClosed(listener: (sessionId: string) => void): () => void {
    this.events.on("closed", listener);
    return () => this.events.off("closed", listener);
  }

  notifyClosed(sessionId: string): void {
    if (this.closedSessions.has(sessionId)) return;
    this.closedSessions.add(sessionId);
    this.events.emit("closed", sessionId);
  }

  async flushWrites(sessionId: string): Promise<void> {
    await this.pendingWrites.get(sessionId);
  }

  private persistOutput(sessionId: string, content: string): void {
    const previousWrite = this.pendingWrites.get(sessionId) ?? Promise.resolve();
    const nextWrite = previousWrite
      .then(() => messageRepository.create(sessionId, "output", content))
      .then(() => undefined)
      .catch((error: unknown) => {
        console.error(`Could not persist terminal output for ${sessionId}:`, error);
      });
    this.pendingWrites.set(sessionId, nextWrite);
    void nextWrite.then(() => {
      if (this.pendingWrites.get(sessionId) === nextWrite) {
        this.pendingWrites.delete(sessionId);
      }
    });
  }

  private async handleRunnerEnd(sessionId: string): Promise<void> {
    await this.flushWrites(sessionId);
    const session = await sessionRepository.findById(sessionId);
    if (!session || session.status === "CLOSED") {
      return;
    }

    await sessionRepository.close(sessionId);
    this.notifyClosed(sessionId);
  }
}

export const terminalService = new TerminalService();
