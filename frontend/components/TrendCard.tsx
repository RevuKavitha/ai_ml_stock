import { PredictResponse } from "@/lib/types";

function trendStyle(trend: PredictResponse["trend"]): string {
  if (trend === "Bullish") return "border border-emerald-300/35 bg-emerald-300/20 text-emerald-100";
  if (trend === "Bearish") return "border border-rose-300/35 bg-rose-300/20 text-rose-100";
  return "border border-amber-300/35 bg-amber-300/20 text-amber-100";
}

export function TrendCard({ prediction }: { prediction: PredictResponse }) {
  return (
    <div className="panel grid gap-4 md:grid-cols-3">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Trend</p>
        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${trendStyle(prediction.trend)}`}>
          {prediction.trend}
        </span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Confidence Score</p>
        <p className="mt-2 text-2xl font-bold text-cyan-100">{prediction.confidence.toFixed(1)}%</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">RMSE</p>
        <p className="mt-2 text-2xl font-bold text-cyan-100">{prediction.rmse.toFixed(3)}</p>
      </div>
    </div>
  );
}
