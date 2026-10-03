export class TerminalService {
  async startTerminal(_sessionId: string): Promise<void> {
    throw new Error("TODO");
  }

  async sendCommand(_sessionId: string, _command: string): Promise<void> {
    throw new Error("TODO");
  }

  async stopTerminal(_sessionId: string): Promise<void> {
    throw new Error("TODO");
  }
}

export const terminalService = new TerminalService();
