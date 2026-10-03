import { useCallback, useEffect, useRef, useState } from "react";
import { getWebSocketUrl } from "@/lib/api";
import {
  isServerMessage,
  type ServerMessage,
  type TerminalInputMessage,
} from "@/types/websocket";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "closed";

interface UseTerminalSocketResult {
  status: ConnectionStatus;
  output: string;
  sendCommand: (command: string) => void;
}

const RECONNECT_DELAY_MS = 2000;

export function useTerminalSocket(sessionId: string): UseTerminalSocketResult {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [output, setOutput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);

  const appendOutput = useCallback((content: string) => {
    setOutput((current) => current + content);
  }, []);

  const handleServerMessage = useCallback(
    (message: ServerMessage) => {
      if (message.type === "terminal_output") {
        appendOutput(message.content);
        return;
      }

      if (message.type === "session_closed") {
        shouldReconnectRef.current = false;
        setStatus("closed");
        appendOutput("\n\n[session closed]\n");
      }
    },
    [appendOutput],
  );

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus("connecting");

    const socket = new WebSocket(getWebSocketUrl(sessionId));
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("connected");
    };

    socket.onmessage = (event) => {
      try {
        const data: unknown = JSON.parse(String(event.data));

        if (isServerMessage(data)) {
          handleServerMessage(data);
        }
      } catch {
        // Ignore malformed messages from the server.
      }
    };

    socket.onclose = () => {
      socketRef.current = null;

      if (!shouldReconnectRef.current) {
        return;
      }

      setStatus("disconnected");

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, RECONNECT_DELAY_MS);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [handleServerMessage, sessionId]);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connect]);

  const sendCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim();
      if (!trimmed) return;

      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      appendOutput(`\n$ ${trimmed}\n`);

      const message: TerminalInputMessage = {
        type: "terminal_input",
        content: trimmed,
      };

      socket.send(JSON.stringify(message));
    },
    [appendOutput],
  );

  return { status, output, sendCommand };
}
