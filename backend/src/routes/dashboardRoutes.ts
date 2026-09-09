import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/stats", optionalAuth, getDashboardStats);

export default router;
