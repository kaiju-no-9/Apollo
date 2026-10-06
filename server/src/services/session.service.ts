import type { CreateSessionResult } from "../types/session.types";
import { messageRepository } from "../repositories/message.repository";
import { sessionRepository } from "../repositories/session.repository";
import { terminalService } from "./terminal.service";

export class SessionService {
  async createSession(): Promise<CreateSessionResult> {
    const session = await sessionRepository.create();
    try {
      await terminalService.startTerminal(session.id);
    } catch (error) {
      await sessionRepository.close(session.id);
      throw error;
    }

    return {
      sessionId: session.id,
      url: `/session/${session.id}`,
    };
  }

  async getSession(sessionId: string) {
    return sessionRepository.findById(sessionId);
  }

  async getMessages(sessionId: string) {
    const session = await sessionRepository.findById(sessionId);
    if (!session) {
      return null;
    }

    const records = await messageRepository.findBySessionId(sessionId);
    return records.map(({ id, sessionId: idForSession, type, content, createdAt }) => ({
      id,
      sessionId: idForSession,
      type,
      content,
      createdAt: createdAt.toISOString(),
    }));
  }

  async closeSession(sessionId: string): Promise<boolean> {
    const session = await sessionRepository.findById(sessionId);
    if (!session) {
      return false;
    }
    if (session.status === "ACTIVE") {
      await sessionRepository.close(sessionId);
      await terminalService.stopTerminal(sessionId);
      terminalService.notifyClosed(sessionId);
    }
    return true;
  }

  async closeOrphanedSessions(): Promise<void> {
    const activeSessions = await sessionRepository.listActive();
    for (const session of activeSessions) {
      await sessionRepository.close(session.id);
    }
  }
}

export const sessionService = new SessionService();
