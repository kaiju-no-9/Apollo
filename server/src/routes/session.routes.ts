import { Router } from "express";

export const sessionRouter = Router();

sessionRouter.get("/:sessionId/messages", (_req, res) => {
  res.status(501).json({
    error: "Not Implemented",
    message:
      "Implement GET /api/sessions/:sessionId/messages to restore session history.",
  });
});

sessionRouter.post("/:sessionId/close", (_req, res) => {
  res.status(501).json({
    error: "Not Implemented",
    message: "Implement POST /api/sessions/:sessionId/close to end a session.",
  });
});
