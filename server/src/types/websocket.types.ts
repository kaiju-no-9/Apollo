/** Client → Server: user sends a terminal command. */
export interface TerminalInputMessage {
  type: "terminal_input";
  content: string;
}

/** Server → Client: streamed terminal output. */
export interface TerminalOutputMessage {
  type: "terminal_output";
  content: string;
}

/** Server → Client: session has been closed. */
export interface SessionClosedMessage {
  type: "session_closed";
}

export type ClientMessage = TerminalInputMessage;

export type ServerMessage = TerminalOutputMessage | SessionClosedMessage;

export function isTerminalInputMessage(
  data: unknown,
): data is TerminalInputMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === "terminal_input" &&
    "content" in data &&
    typeof data.content === "string"
  );
}
