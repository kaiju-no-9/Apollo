import { randomUUID } from "node:crypto";
import type { Session } from "../types/session.types";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { sessions } from "../db/schema";
import { projectRepository } from "./project.repository";

export class SessionRepository {
  async create(): Promise<Session> {
    await projectRepository.ensureDefault();

    const session: Session = {
      id: randomUUID(),
      projectId: "default-project",
      status: "ACTIVE",
      createdAt: new Date(),
      closedAt: null,
    };

    await db.insert(sessions).values(session);
    return session;
  }

  async findById(sessionId: string): Promise<Session | null> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);
    return session ?? null;
  }

  async close(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ status: "CLOSED", closedAt: new Date() })
      .where(and(eq(sessions.id, sessionId), eq(sessions.status, "ACTIVE")));
  }

  async listActive(): Promise<Session[]> {
    return db.select().from(sessions).where(eq(sessions.status, "ACTIVE"));
  }
}

export const sessionRepository = new SessionRepository();
