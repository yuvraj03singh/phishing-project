export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PredictionLabel = 'phishing' | 'legitimate';

export interface ExplanationItem {
  feature: string;
  value: any;
  contribution: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface PredictionResult {
  id?: string;
  url: string;
  prediction: PredictionLabel;
  isPhishing: boolean;
  is_phishing?: boolean;
  probability: number;
  riskScore: number;
  risk_score?: number;
  riskLevel: RiskLevel;
  risk_level?: RiskLevel;
  modelVersion: string;
  model_version?: string;
  modelName: string;
  model_name?: string;
  inferenceLatencyMs: number;
  inference_latency_ms?: number;
  features: Record<string, any>;
  featureSummary?: Record<string, any>;
  explanations: ExplanationItem[];
  disclaimer?: string;
  createdAt?: string;
}

export interface BatchItemResult {
  url: string;
  prediction: PredictionLabel;
  is_phishing: boolean;
  probability: number;
  risk_level: RiskLevel;
  risk_score: number;
}

export interface BatchScanResult {
  total_scanned: number;
  phishing_count: number;
  legitimate_count: number;
  total_time_ms: number;
  results: BatchItemResult[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface DashboardStats {
  summary: {
    totalScanned: number;
    phishingCount: number;
    legitimateCount: number;
    phishingRatio: number;
    legitimateRatio: number;
  };
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  timeline: {
    day: string;
    scans: number;
    phishing: number;
  }[];
  recentScans: PredictionResult[];
  modelInfo?: any;
}

export interface FeatureMeta {
  name: string;
  category: string;
  description: string;
}
