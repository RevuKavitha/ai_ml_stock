"use client";

import { StockPoint } from "@/lib/types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function PriceChart({ data }: { data: StockPoint[] }) {
  return (
    <div className="panel h-[340px]">
      <h3 className="mb-4 text-lg font-bold text-slate-100">Price Trend + Moving Averages</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9fb4d8" }} minTickGap={18} />
          <YAxis tick={{ fontSize: 11, fill: "#9fb4d8" }} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "#0b1b34", border: "1px solid rgba(148, 163, 184, 0.25)", borderRadius: 12 }} labelStyle={{ color: "#dbeafe" }} itemStyle={{ color: "#e2e8f0" }} />
          <Line type="monotone" dataKey="close" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="ma20" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ma50" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
