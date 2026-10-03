import type { MessageRecord } from "../types/message.types";

export class MessageRepository {
  async create(
    _sessionId: string,
    _type: "input" | "output",
    _content: string,
  ): Promise<MessageRecord> {
    throw new Error("TODO");
  }

  async findBySessionId(_sessionId: string): Promise<MessageRecord[]> {
    throw new Error("TODO");
  }

  async deleteBySessionId(_sessionId: string): Promise<void> {
    throw new Error("TODO");
  }
}

export const messageRepository = new MessageRepository();
