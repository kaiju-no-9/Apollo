import { Router } from "express";
import { sessionService } from "../services/session.service";

export const setupRouter = Router();

setupRouter.post("/setup", async (_req, res) => {
  try {
    const session = await sessionService.createSession();
    res.status(201).json(session);
  } catch (error) {
    console.error("Could not create a remote session:", error);
    res.status(500).json({ error: "Could not create a remote session." });
  }
});
