import type { Session } from "../types/session.types";

export class SessionRepository {
  async create(): Promise<Session> {
    throw new Error("TODO");
  }

  async findById(_sessionId: string): Promise<Session | null> {
    throw new Error("TODO");
  }

  async close(_sessionId: string): Promise<void> {
    throw new Error("TODO");
  }

  async listActive(): Promise<Session[]> {
    throw new Error("TODO");
  }
}

export const sessionRepository = new SessionRepository();
