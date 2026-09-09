import { Router, Request, Response } from "express";
import { mlClient } from "../services/mlClient.js";

const router = Router();

router.get("/health", async (req: Request, res: Response) => {
  const mlHealth = await mlClient.checkHealth();
  res.status(200).json({
    status: "healthy",
    service: "Phishing Detection Backend Gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mlService: mlHealth
  });
});

export default router;
