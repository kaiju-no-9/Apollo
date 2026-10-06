import { randomUUID } from "node:crypto";
import type { MessageRecord } from "../types/message.types";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { messages } from "../db/schema";

export class MessageRepository {
  async create(
    sessionId: string,
    type: "input" | "output",
    content: string,
  ): Promise<MessageRecord> {
    const message: MessageRecord = {
      id: randomUUID(),
      sessionId,
      type,
      content,
      createdAt: new Date(),
    };
    await db.insert(messages).values(message);
    return message;
  }

  async findBySessionId(sessionId: string): Promise<MessageRecord[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.sequence));
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    await db.delete(messages).where(eq(messages.sessionId, sessionId));
  }
}

export const messageRepository = new MessageRepository();
