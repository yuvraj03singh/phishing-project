import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { logger } from "./utils/logger.js";

const PORT = parseInt(process.env.PORT || "5000", 10);

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    logger.info(`===========================================================`);
    logger.info(`  Phishing Detection Gateway running on port ${PORT}`);
    logger.info(`  Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`  Health Check: http://localhost:${PORT}/api/health`);
    logger.info(`===========================================================`);
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
