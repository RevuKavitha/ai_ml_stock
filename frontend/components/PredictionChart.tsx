"use client";

import { ComparisonPoint, PredictionPoint } from "@/lib/types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface PredictionChartProps {
  comparison: ComparisonPoint[];
  forecast: PredictionPoint[];
}

export function PredictionChart({ comparison, forecast }: PredictionChartProps) {
  const data = [
    ...comparison.map((item) => ({ date: item.date, actual: item.actual, predicted: item.predicted })),
    ...forecast.map((item) => ({ date: item.date, actual: null, predicted: item.predicted }))
  ];

  return (
    <div className="panel h-[340px]">
      <h3 className="mb-4 text-lg font-bold text-slate-100">Actual vs Predicted + 7-Day Forecast</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9fb4d8" }} minTickGap={18} />
          <YAxis tick={{ fontSize: 11, fill: "#9fb4d8" }} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "#0b1b34", border: "1px solid rgba(148, 163, 184, 0.25)", borderRadius: 12 }} labelStyle={{ color: "#dbeafe" }} itemStyle={{ color: "#e2e8f0" }} />
          <Line type="monotone" dataKey="actual" stroke="#f1f5f9" strokeWidth={2.3} dot={false} connectNulls />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#fb7185"
            strokeWidth={2.3}
            strokeDasharray="4 4"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
