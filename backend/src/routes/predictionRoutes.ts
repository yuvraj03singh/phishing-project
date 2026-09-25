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

router.post("/", predictionLimiter, authenticate, scanUrl);
router.post("/batch", batchPredictionLimiter, optionalAuth, scanBatch);
router.get("/", authenticate, getPredictions);
router.get("/:id", authenticate, getPredictionById);
router.delete("/:id", authenticate, deletePrediction);

export default router;
