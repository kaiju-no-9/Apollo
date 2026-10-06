import { Router } from "express";
import { sessionService } from "../services/session.service";

export const sessionRouter = Router();

sessionRouter.get("/:sessionId/messages", async (req, res) => {
  try {
    const messages = await sessionService.getMessages(req.params.sessionId);
    if (!messages) {
      res.status(404).json({ error: "Session not found." });
      return;
    }
    res.json(messages);
  } catch (error) {
    console.error("Could not load session messages:", error);
    res.status(500).json({ error: "Could not load session messages." });
  }
});

sessionRouter.post("/:sessionId/close", async (req, res) => {
  try {
    const closed = await sessionService.closeSession(req.params.sessionId);
    if (!closed) {
      res.status(404).json({ error: "Session not found." });
      return;
    }
    res.json({ sessionId: req.params.sessionId, status: "CLOSED" });
  } catch (error) {
    console.error("Could not close remote session:", error);
    res.status(500).json({ error: "Could not close remote session." });
  }
});
