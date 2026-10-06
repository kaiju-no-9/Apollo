import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import WebSocket, { WebSocketServer, type RawData } from "ws";
import { isTerminalInputMessage } from "./types/websocket.types";
import { setupRouter } from "./routes/setup.routes";
import { sessionRouter } from "./routes/session.routes";
import { sessionService } from "./services/session.service";
import { terminalService } from "./services/terminal.service";

const PORT = Number(process.env.PORT) || 3000;
const clientsBySession = new Map<string, Set<WebSocket>>();

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", setupRouter);
app.use("/api/sessions", sessionRouter);

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

function removeClient(sessionId: string, ws: WebSocket): void {
  const clients = clientsBySession.get(sessionId);
  if (!clients) return;
  clients.delete(ws);
  if (clients.size === 0) clientsBySession.delete(sessionId);
}

function sendToSession(sessionId: string, message: object): void {
  const clients = clientsBySession.get(sessionId);
  if (!clients) return;
  const serialized = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  }
}

terminalService.onOutput((sessionId, content) => {
  sendToSession(sessionId, { type: "terminal_output", content });
});

terminalService.onClosed((sessionId) => {
  const clients = clientsBySession.get(sessionId);
  if (!clients) return;
  const serialized = JSON.stringify({ type: "session_closed" });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized, () => client.close(1000, "Session closed"));
    }
  }
});

function decodeMessage(rawMessage: RawData): unknown {
  if (Array.isArray(rawMessage)) {
    return JSON.parse(Buffer.concat(rawMessage).toString());
  }
  if (rawMessage instanceof ArrayBuffer) {
    return JSON.parse(Buffer.from(rawMessage).toString());
  }
  return JSON.parse(rawMessage.toString());
}

wss.on("connection", (ws, request) => {
  const requestUrl = new URL(
    request.url ?? "/ws",
    `http://${request.headers.host ?? "localhost"}`,
  );
  const sessionId = requestUrl.searchParams.get("sessionId");

  if (!sessionId) {
    ws.close(1008, "Missing sessionId query parameter");
    return;
  }

  let connectionValid = false;
  const connectionReady = sessionService
    .getSession(sessionId)
    .then((session) => {
      if (!session || session.status !== "ACTIVE") {
        ws.close(1008, "Session not found or closed");
        return false;
      }
      connectionValid = true;
      const clients = clientsBySession.get(sessionId) ?? new Set<WebSocket>();
      clients.add(ws);
      clientsBySession.set(sessionId, clients);
      return true;
    })
    .catch((error: unknown) => {
      console.error(`Could not validate session ${sessionId}:`, error);
      ws.close(1011, "Could not validate session");
      return false;
    });

  let incomingMessages = Promise.resolve();
  ws.on("message", (rawMessage) => {
    incomingMessages = incomingMessages.then(async () => {
      if (!(await connectionReady) || !connectionValid) return;

      let message: unknown;
      try {
        message = decodeMessage(rawMessage);
      } catch {
        ws.close(1003, "Malformed JSON message");
        return;
      }

      if (!isTerminalInputMessage(message)) {
        ws.close(1003, "Unsupported message");
        return;
      }

      try {
        const session = await sessionService.getSession(sessionId);
        if (!session || session.status !== "ACTIVE") {
          ws.close(1008, "Session is closed");
          return;
        }
        await terminalService.sendCommand(sessionId, message.content);
      } catch (error) {
        console.error(`Could not forward command for ${sessionId}:`, error);
        ws.close(1011, "Could not forward terminal input");
      }
    });
  });

  ws.on("close", () => removeClient(sessionId, ws));
});

async function startServer(): Promise<void> {
  await sessionService.closeOrphanedSessions();
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error("Could not start the backend:", error);
  process.exitCode = 1;
});
