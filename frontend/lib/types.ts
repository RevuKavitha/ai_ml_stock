export type TimeRange = "1mo" | "6mo" | "1y";

export interface StockPoint {
  date: string;
  close: number;
  ma20: number | null;
  ma50: number | null;
  volume: number;
}

export interface StockDataResponse {
  ticker: string;
  range: TimeRange;
  points: StockPoint[];
  insights: string[];
}

export interface PredictionPoint {
  date: string;
  predicted: number;
}

export interface ComparisonPoint {
  date: string;
  actual: number;
  predicted: number;
}

export interface PredictResponse {
  ticker: string;
  range: TimeRange;
  trend: "Bullish" | "Bearish" | "Neutral";
  confidence: number;
  rmse: number;
  explanation: string;
  predictions: PredictionPoint[];
  comparison: ComparisonPoint[];
  insights: string[];
}
