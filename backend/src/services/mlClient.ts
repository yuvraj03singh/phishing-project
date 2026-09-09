import axios, { AxiosInstance } from "axios";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export class MLServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ML_SERVICE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PhishingDetectionBackend/1.0"
      }
    });
  }

  public async checkHealth(): Promise<any> {
    try {
      const response = await this.client.get("/health");
      return response.data;
    } catch (error: any) {
      logger.warn(`ML Service Health Check failed: ${error.message}`);
      return { status: "offline", error: error.message };
    }
  }

  public async getModelInfo(): Promise<any> {
    try {
      const response = await this.client.get("/model-info");
      return response.data;
    } catch (error: any) {
      throw new AppError("Failed to fetch ML model metadata from inference engine.", 502, "ML_SERVICE_UNAVAILABLE");
    }
  }

  public async getFeaturesCatalog(): Promise<any> {
    try {
      const response = await this.client.get("/features");
      return response.data;
    } catch (error: any) {
      throw new AppError("Failed to fetch features catalog from ML service.", 502, "ML_SERVICE_UNAVAILABLE");
    }
  }

  public async predict(url: string): Promise<any> {
    try {
      const response = await this.client.post("/predict", { url });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const detail = error.response.data?.detail;
        const msg = typeof detail === "object" ? detail.message || JSON.stringify(detail) : detail || error.message;
        throw new AppError(msg, error.response.status, "ML_INFERENCE_ERROR");
      }
      logger.error("ML service communication failed:", error.message);
      throw new AppError("ML Inference Service is currently unavailable. Please verify that the Python ML engine is running.", 503, "ML_SERVICE_DOWN");
    }
  }

  public async predictBatch(urls: string[]): Promise<any> {
    try {
      const response = await this.client.post("/predict/batch", { urls });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new AppError(error.response.data?.detail || "Batch prediction error", error.response.status, "ML_BATCH_ERROR");
      }
      throw new AppError("ML Inference Service is currently unreachable for batch processing.", 503, "ML_SERVICE_DOWN");
    }
  }
}

export const mlClient = new MLServiceClient();
