import { Router } from "express";
import {
  scanUrl,
  scanBatch,
  getPredictions,
  getPredictionById,
  deletePrediction
} from "../controllers/predictionController.js";
import { optionalAuth, authenticate } from "../middleware/auth.js";
import { predictionLimiter, batchPredictionLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", predictionLimiter, optionalAuth, scanUrl);
router.post("/batch", batchPredictionLimiter, optionalAuth, scanBatch);
router.get("/", optionalAuth, getPredictions);
router.get("/:id", optionalAuth, getPredictionById);
router.delete("/:id", authenticate, deletePrediction);

export default router;
