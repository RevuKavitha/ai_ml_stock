"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { PredictionChart } from "@/components/PredictionChart";
import { PriceChart } from "@/components/PriceChart";
import { StockControls } from "@/components/StockControls";
import { TrendCard } from "@/components/TrendCard";
import { VolumeChart } from "@/components/VolumeChart";
import { fetchPrediction, fetchStockData } from "@/lib/api";
import { PredictResponse, StockDataResponse, TimeRange } from "@/lib/types";

export default function HomePage() {
  const [ticker, setTicker] = useState("AAPL");
  const [range, setRange] = useState<TimeRange>("6mo");
  const [stockData, setStockData] = useState<StockDataResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!ticker.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const [stockResp, predictResp] = await Promise.all([
        fetchStockData(ticker, range),
        fetchPrediction(ticker, range)
      ]);
      setStockData(stockResp);
      setPrediction(predictResp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      setStockData(null);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, [ticker, range]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const combinedInsights = useMemo(() => {
    const stockInsights = stockData?.insights ?? [];
    const predictionInsights = prediction?.insights ?? [];
    return [...stockInsights, ...predictionInsights];
  }, [stockData, prediction]);

  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden p-4 pb-12 md:p-8">
      <div className="floating-orb left-[-70px] top-[40px] h-52 w-52 bg-cyan-400" />
      <div className="floating-orb right-[-50px] top-[210px] h-44 w-44 bg-teal-300" />
      <div className="floating-orb bottom-[-30px] left-[42%] h-40 w-40 bg-indigo-400" />

      <section className="mb-6 fade-up">
        <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Premium AI Trading Dashboard
        </div>
        <h1 className="premium-title text-3xl font-extrabold md:text-5xl">AI Stock Price Predictor and Analyzer</h1>
        <p className="mt-2 max-w-3xl text-base muted md:text-lg">
          Select a stock, inspect trend indicators, and view ML-based 7-day forecasts with high-clarity analytics.
        </p>
      </section>

      <section className="mb-6 fade-up stagger-1">
        <StockControls
          ticker={ticker}
          range={range}
          onTickerChange={setTicker}
          onRangeChange={setRange}
        />
      </section>

      {loading && (
        <div className="panel animate-pulse text-cyan-100 fade-up stagger-2">
          Loading market data and training prediction model...
        </div>
      )}

      {error && (
        <div className="panel fade-up stagger-2 border border-rose-300/35 bg-rose-400/10 text-rose-100">
          Error: {error}
        </div>
      )}

      {!loading && !error && stockData && prediction && (
        <>
          <section className="mb-6 fade-up stagger-2">
            <TrendCard prediction={prediction} />
          </section>

          <section className="mb-6 grid gap-6 fade-up stagger-3 lg:grid-cols-2">
            <PriceChart data={stockData.points} />
            <VolumeChart data={stockData.points} />
          </section>

          <section className="mb-6 fade-up stagger-4">
            <PredictionChart comparison={prediction.comparison} forecast={prediction.predictions} />
          </section>

          <section className="grid gap-6 fade-up stagger-4 lg:grid-cols-2">
            <div className="panel">
              <h3 className="mb-2 text-lg font-bold text-slate-100">Why this prediction?</h3>
              <p className="text-sm leading-7 muted">{prediction.explanation}</p>
            </div>
            <div className="panel">
              <h3 className="mb-2 text-lg font-bold text-slate-100">Key Insights</h3>
              <ul className="space-y-2 text-sm muted">
                {combinedInsights.map((insight, idx) => (
                  <li
                    key={`${insight}-${idx}`}
                    className="rounded-lg border border-slate-400/20 bg-slate-300/10 px-3 py-2 text-slate-100"
                  >
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
