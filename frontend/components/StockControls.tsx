"use client";

import { TimeRange } from "@/lib/types";

const STOCKS = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA", "META"];
const RANGES: TimeRange[] = ["1mo", "6mo", "1y"];

interface StockControlsProps {
  ticker: string;
  range: TimeRange;
  onTickerChange: (ticker: string) => void;
  onRangeChange: (range: TimeRange) => void;
}

export function StockControls({ ticker, range, onTickerChange, onRangeChange }: StockControlsProps) {
  return (
    <div className="panel flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-200">Stock Ticker</label>
        <div className="flex gap-2">
          <select
            value={STOCKS.includes(ticker) ? ticker : ""}
            onChange={(e) => onTickerChange(e.target.value)}
            className="rounded-xl border border-slate-300/30 bg-slate-100/10 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          >
            <option value="" disabled>
              Select stock
            </option>
            {STOCKS.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
          <input
            value={ticker}
            onChange={(e) => onTickerChange(e.target.value.toUpperCase())}
            placeholder="Or type ticker"
            className="rounded-xl border border-slate-300/30 bg-slate-100/10 px-3 py-2 text-sm uppercase text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-200">Time Range</span>
        <div className="flex gap-2">
          {RANGES.map((item) => (
            <button
              key={item}
              onClick={() => onRangeChange(item)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                range === item
                  ? "glow-badge"
                  : "border border-slate-400/20 bg-slate-300/10 text-slate-200 hover:-translate-y-0.5 hover:bg-slate-300/20"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
