export interface Message {
  id: string;
  sessionId: string;
  type: "input" | "output";
  content: string;
  createdAt: string;
}

export interface MessageRecord {
  id: string;
  sessionId: string;
  type: "input" | "output";
  content: string;
  createdAt: Date;
}
