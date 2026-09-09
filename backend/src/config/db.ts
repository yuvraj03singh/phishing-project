import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/phishing_detection";

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`Connected to MongoDB successfully: ${mongoUri.split("@").pop()}`);
  } catch (error) {
    logger.warn(`Could not establish connection to MongoDB at ${mongoUri}. Prediction history will operate in non-blocking mode.`);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected.");
  });
};
