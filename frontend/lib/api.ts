import { PredictResponse, StockDataResponse, TimeRange } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    let message = "Request failed";
    try {
      const json = await response.json();
      message = json.detail ?? message;
    } catch {
      // Ignore parse failure and keep generic message.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function fetchStockData(ticker: string, range: TimeRange) {
  return request<StockDataResponse>(`/stock-data?ticker=${ticker}&range=${range}`);
}

export function fetchPrediction(ticker: string, range: TimeRange) {
  return request<PredictResponse>(`/predict?ticker=${ticker}&range=${range}`);
}
