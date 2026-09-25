import { Request, Response, NextFunction } from "express";
import { Prediction } from "../models/Prediction.js";
import { ScanUrlSchema, BatchScanSchema } from "../utils/validators.js";
import { mlClient } from "../services/mlClient.js";
import { AppError } from "../utils/errors.js";
import { AuthRequest } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

export const scanUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = ScanUrlSchema.parse(req.body);
    if (!req.userId) {
      throw new AppError("Please log in before scanning a URL.", 401, "UNAUTHORIZED");
    }
    const userId = req.userId;

    // Call ML Microservice
    const mlResponse = await mlClient.predict(validated.url);

    // Persist prediction so it is available in the user's scan history.
    let savedDoc = null;
    try {
      savedDoc = await Prediction.create({
        userId,
        url: mlResponse.url,
        prediction: mlResponse.prediction,
        isPhishing: mlResponse.is_phishing,
        probability: mlResponse.probability,
        riskScore: mlResponse.risk_score,
        riskLevel: mlResponse.risk_level,
        modelVersion: mlResponse.model_version,
        modelName: mlResponse.model_name,
        inferenceLatencyMs: mlResponse.inference_latency_ms,
        featureSummary: mlResponse.features,
        explanations: mlResponse.explanations
      });
    } catch (dbErr: any) {
      logger.warn(`Could not save prediction to MongoDB: ${dbErr.message}`);
      throw new AppError(
        "The scan completed, but the result could not be saved to your history. Please try again.",
        503,
        "HISTORY_UNAVAILABLE"
      );
    }

    res.status(200).json({
      success: true,
      data: {
        id: savedDoc ? savedDoc._id : null,
        url: mlResponse.url,
        prediction: mlResponse.prediction,
        isPhishing: mlResponse.is_phishing,
        probability: mlResponse.probability,
        riskScore: mlResponse.risk_score,
        riskLevel: mlResponse.risk_level,
        modelVersion: mlResponse.model_version,
        modelName: mlResponse.model_name,
        inferenceLatencyMs: mlResponse.inference_latency_ms,
        features: mlResponse.features,
        explanations: mlResponse.explanations,
        disclaimer: mlResponse.disclaimer,
        createdAt: savedDoc ? savedDoc.createdAt : new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const scanBatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = BatchScanSchema.parse(req.body);
    const mlResponse = await mlClient.predictBatch(validated.urls);

    res.status(200).json({
      success: true,
      data: mlResponse
    });
  } catch (error) {
    next(error);
  }
};

export const getPredictions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError("Please log in to view scan history.", 401, "UNAUTHORIZED");
    }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: any = { userId: req.userId };

    if (req.query.riskLevel) {
      query.riskLevel = (req.query.riskLevel as string).toUpperCase();
    }

    if (req.query.prediction) {
      query.prediction = (req.query.prediction as string).toLowerCase();
    }

    if (req.query.search) {
      query.url = { $regex: req.query.search as string, $options: "i" };
    }

    let items: any[] = [];
    let total = 0;

    try {
      [items, total] = await Promise.all([
        Prediction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Prediction.countDocuments(query)
      ]);
    } catch (e) {
      logger.warn("Could not query MongoDB for prediction history.");
      throw new AppError(
        "Scan history is temporarily unavailable. Please try again.",
        503,
        "HISTORY_UNAVAILABLE"
      );
    }

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPredictionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError("Please log in to view scan history.", 401, "UNAUTHORIZED");
    }

    const item = await Prediction.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      throw new AppError("Prediction record not found.", 404, "NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const deletePrediction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError("Please log in to manage scan history.", 401, "UNAUTHORIZED");
    }

    const item = await Prediction.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      throw new AppError("Prediction record not found.", 404, "NOT_FOUND");
    }

    await Prediction.deleteOne({ _id: req.params.id, userId: req.userId });

    res.status(200).json({
      success: true,
      message: "Prediction deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};
