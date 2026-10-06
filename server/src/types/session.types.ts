export interface Session {
  id: string;
  projectId: string;
  status: "ACTIVE" | "CLOSED";
  createdAt: Date;
  closedAt: Date | null;
}

export interface CreateSessionResult {
  sessionId: string;
  url: string;
}
