"use client";

import { StockPoint } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function VolumeChart({ data }: { data: StockPoint[] }) {
  return (
    <div className="panel h-[300px]">
      <h3 className="mb-4 text-lg font-bold text-slate-100">Volume Chart</h3>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9fb4d8" }} minTickGap={18} />
          <YAxis tick={{ fontSize: 11, fill: "#9fb4d8" }} />
          <Tooltip contentStyle={{ background: "#0b1b34", border: "1px solid rgba(148, 163, 184, 0.25)", borderRadius: 12 }} labelStyle={{ color: "#dbeafe" }} itemStyle={{ color: "#e2e8f0" }} />
          <Bar dataKey="volume" fill="#38bdf8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
