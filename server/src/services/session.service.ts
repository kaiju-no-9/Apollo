import type { CreateSessionResult } from "../types/session.types";

export class SessionService {
  async createSession(): Promise<CreateSessionResult> {
    throw new Error("TODO");
  }

  async getSession(_sessionId: string): Promise<void> {
    throw new Error("TODO");
  }

  async closeSession(_sessionId: string): Promise<void> {
    throw new Error("TODO");
  }
}

export const sessionService = new SessionService();
