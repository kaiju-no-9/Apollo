export interface TerminalInputMessage {
  type: "terminal_input";
  content: string;
}

export interface TerminalOutputMessage {
  type: "terminal_output";
  content: string;
}

export interface SessionClosedMessage {
  type: "session_closed";
}

export type ServerMessage = TerminalOutputMessage | SessionClosedMessage;

export interface SessionMessage {
  id: string;
  sessionId: string;
  type: "input" | "output";
  content: string;
  createdAt: string;
}

export function isServerMessage(data: unknown): data is ServerMessage {
  if (typeof data !== "object" || data === null || !("type" in data)) {
    return false;
  }

  const messageType = data.type;

  return (
    messageType === "terminal_output" ||
    messageType === "session_closed"
  );
}
