export interface Session {
  id: string;
  createdAt: Date;
  closedAt: Date | null;
}

export interface CreateSessionResult {
  sessionId: string;
  url: string;
}
