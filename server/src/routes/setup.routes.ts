import { Router } from "express";

export const setupRouter = Router();

setupRouter.post("/setup", (_req, res) => {
  res.status(501).json({
    error: "Not Implemented",
    message: "Implement POST /api/setup to create a remote session.",
  });
});
