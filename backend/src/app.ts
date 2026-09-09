import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import { errorHandler } from "./utils/errors.js";
import { logger } from "./utils/logger.js";

import authRoutes from "./routes/authRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

const app: Express = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Request logging & ID middleware
app.use((req: Request, res: Response, next) => {
  const reqId = uuidv4();
  const start = Date.now();
  res.setHeader("X-Request-ID", reqId);

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms (ReqID: ${reqId})`);
  });
  next();
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", healthRoutes);

// Root
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    service: "Phishing Detection Backend Gateway API",
    version: "1.0.0",
    docs: "/api/health"
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
