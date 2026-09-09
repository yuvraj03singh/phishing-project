import mongoose, { Document, Schema } from "mongoose";

export interface IExplanation {
  feature: string;
  value: any;
  contribution: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export interface IPrediction extends Document {
  userId?: mongoose.Types.ObjectId;
  url: string;
  prediction: "phishing" | "legitimate";
  isPhishing: boolean;
  probability: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  modelVersion: string;
  modelName: string;
  inferenceLatencyMs: number;
  featureSummary: Record<string, any>;
  explanations: IExplanation[];
  createdAt: Date;
}

const ExplanationSchema = new Schema<IExplanation>(
  {
    feature: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
    contribution: { type: String, required: true },
    severity: { type: String, enum: ["INFO", "WARNING", "CRITICAL"], default: "INFO" }
  },
  { _id: false }
);

const PredictionSchema = new Schema<IPrediction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, default: null },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    prediction: { type: String, enum: ["phishing", "legitimate"], required: true, index: true },
    isPhishing: { type: Boolean, required: true, index: true },
    probability: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true, index: true },
    modelVersion: { type: String, default: "1.0.0" },
    modelName: { type: String, default: "Phishing Hybrid Classifier" },
    inferenceLatencyMs: { type: Number, default: 0 },
    featureSummary: { type: Map, of: Schema.Types.Mixed, default: {} },
    explanations: [ExplanationSchema]
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

PredictionSchema.index({ createdAt: -1 });

export const Prediction = mongoose.model<IPrediction>("Prediction", PredictionSchema);
