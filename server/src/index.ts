import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";
import { setupRouter } from "./routes/setup.routes";
import { sessionRouter } from "./routes/session.routes";

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", setupRouter);
app.use("/api/sessions", sessionRouter);

const httpServer = createServer(app);

const wss = new WebSocketServer({
  server: httpServer,
  path: "/ws",
});

/**
 * WebSocket connections arrive at /ws?sessionId=<id>.
 * Students wire terminal I/O and broadcasting here.
 */
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

  ws.on("message", (_rawMessage) => {
    // Students implement terminal_input handling and terminal_output broadcasting.
  });

  ws.on("close", () => {
    // Students implement cleanup when the remote client disconnects.
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
