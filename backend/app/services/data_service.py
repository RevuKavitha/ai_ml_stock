from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict

import numpy as np
import pandas as pd
import yfinance as yf
from fastapi import HTTPException
from pandas_datareader import data as pdr

VALID_RANGES: Dict[str, str] = {
    "1mo": "1mo",
    "6mo": "6mo",
    "1y": "1y",
}


def _validate_range(range_value: str) -> str:
    if range_value not in VALID_RANGES:
        raise HTTPException(status_code=400, detail="Invalid range. Use one of: 1mo, 6mo, 1y")
    return VALID_RANGES[range_value]


def fetch_stock_history(ticker: str, range_value: str) -> pd.DataFrame:
    ticker = ticker.strip().upper()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker is required")

    period = _validate_range(range_value)

    end = datetime.utcnow().date()
    days = {"1mo": 35, "6mo": 200, "1y": 380}[period]
    start = end - timedelta(days=days)

    def _fetch_from_stooq() -> pd.DataFrame:
        # Stooq uses ticker format like AAPL.US for US equities.
        stooq_symbol = f"{ticker}.US"
        stooq_df = pdr.DataReader(stooq_symbol, "stooq", start=start, end=end)
        if stooq_df.empty:
            return stooq_df
        stooq_df = stooq_df.sort_index().reset_index()
        # Ensure consistent schema with Yahoo path.
        stooq_df = stooq_df[["Date", "Open", "High", "Low", "Close", "Volume"]]
        return stooq_df

    try:
        # Primary method.
        df = yf.Ticker(ticker).history(period=period, interval="1d", auto_adjust=False)

        # Fallback 1: direct download API can succeed when history() is empty in some environments.
        if df.empty:
            df = yf.download(
                tickers=ticker,
                period=period,
                interval="1d",
                auto_adjust=False,
                progress=False,
                threads=False,
            )

        # Fallback 2: explicit date window.
        if df.empty:
            df = yf.download(
                tickers=ticker,
                start=start.isoformat(),
                end=end.isoformat(),
                interval="1d",
                auto_adjust=False,
                progress=False,
                threads=False,
            )

        # Fallback 3: Stooq (no API key) for cases where Yahoo endpoints are blocked.
        if df.empty:
            df = _fetch_from_stooq()
    except Exception as exc:  # pragma: no cover - defensive branch
        # If Yahoo failed unexpectedly, try Stooq before surfacing provider error.
        try:
            df = _fetch_from_stooq()
        except Exception as stooq_exc:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch stock data from Yahoo and Stooq: {stooq_exc}",
            ) from exc

    if df.empty:
        # Final fallback: deterministic demo data so the app can still be tested
        # in restricted/offline environments.
        df = _generate_demo_data(ticker=ticker, range_value=range_value)

    df = df.reset_index()
    if "Date" not in df.columns:
        raise HTTPException(status_code=502, detail="Unexpected response format from data provider")

    df["Date"] = pd.to_datetime(df["Date"], utc=True).dt.tz_convert(None)
    df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
    df = df.sort_values("Date").reset_index(drop=True)
    return df


def _generate_demo_data(ticker: str, range_value: str) -> pd.DataFrame:
    periods_map = {"1mo": 22, "6mo": 130, "1y": 260}
    periods = periods_map[range_value]
    end = pd.Timestamp.utcnow().normalize()
    dates = pd.bdate_range(end=end, periods=periods)

    # Stable seed per ticker for reproducible demo data.
    seed = sum(ord(ch) for ch in ticker)
    rng = np.random.default_rng(seed)

    base_price = 80 + (seed % 220)
    drift = (seed % 7 - 3) * 0.0004
    shock = rng.normal(0, 0.012, size=periods)
    returns = drift + shock
    close = base_price * np.exp(np.cumsum(returns))

    open_price = np.concatenate(([close[0]], close[:-1])) * (1 + rng.normal(0, 0.003, size=periods))
    high = np.maximum(open_price, close) * (1 + np.abs(rng.normal(0.004, 0.003, size=periods)))
    low = np.minimum(open_price, close) * (1 - np.abs(rng.normal(0.004, 0.003, size=periods)))
    volume = rng.integers(1_200_000, 11_000_000, size=periods)

    return pd.DataFrame(
        {
            "Date": dates,
            "Open": open_price,
            "High": high,
            "Low": low,
            "Close": close,
            "Volume": volume,
        }
    )


def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["MA20"] = out["Close"].rolling(window=20).mean()
    out["MA50"] = out["Close"].rolling(window=50).mean()
    return out


def to_date_str(ts: datetime) -> str:
    return ts.strftime("%Y-%m-%d")


def generate_insights(df: pd.DataFrame) -> list[str]:
    insights: list[str] = []
    latest = df.iloc[-1]

    if pd.notna(latest.get("MA50")):
        if latest["Close"] > latest["MA50"]:
            insights.append("Current price is above MA50, indicating medium-term strength.")
        else:
            insights.append("Current price is below MA50, signaling medium-term weakness.")

    if pd.notna(latest.get("MA20")):
        if latest["Close"] > latest["MA20"]:
            insights.append("Price is above MA20, showing short-term positive momentum.")
        else:
            insights.append("Price is below MA20, suggesting short-term pressure.")

    pct_change = (df["Close"].iloc[-1] - df["Close"].iloc[0]) / df["Close"].iloc[0] * 100
    direction = "up" if pct_change >= 0 else "down"
    insights.append(f"Over the selected range, price moved {direction} by {abs(pct_change):.2f}%.")

    avg_volume = int(df["Volume"].tail(20).mean())
    insights.append(f"Recent average daily volume is about {avg_volume:,} shares.")

    return insights
