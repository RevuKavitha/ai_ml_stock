from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error


@dataclass
class PredictionResult:
    trend: str
    confidence: float
    rmse: float
    explanation: str
    predictions: list[dict]
    comparison: list[dict]
    insights: list[str]


def _build_features(df: pd.DataFrame) -> pd.DataFrame:
    feat = df.copy()
    # Lag features capture immediate temporal momentum from previous closes.
    feat["lag_1"] = feat["Close"].shift(1)
    feat["lag_2"] = feat["Close"].shift(2)
    feat["lag_3"] = feat["Close"].shift(3)

    # Rolling stats provide local trend and volatility context.
    feat["rolling_mean_5"] = feat["Close"].rolling(window=5, min_periods=3).mean()
    feat["rolling_std_5"] = feat["Close"].rolling(window=5, min_periods=3).std()
    feat["ma20"] = feat["Close"].rolling(window=20, min_periods=5).mean()
    feat["ma50"] = feat["Close"].rolling(window=50, min_periods=10).mean()

    # Predict next trading day close.
    feat["target"] = feat["Close"].shift(-1)
    return feat.dropna().reset_index(drop=True)


def _extract_insights(last_close: float, last_ma20: float, last_ma50: float, rmse: float) -> list[str]:
    insights: list[str] = []

    if last_close > last_ma50:
        insights.append("Price is above MA50, supporting a stronger medium-term structure.")
    else:
        insights.append("Price is below MA50, which may cap upside until trend improves.")

    if last_close > last_ma20:
        insights.append("Price is trading above MA20, indicating short-term strength.")
    else:
        insights.append("Price is trading below MA20, indicating short-term weakness.")

    insights.append(f"Model validation RMSE is {rmse:.2f}; lower values indicate tighter fit.")
    return insights


def run_prediction(df: pd.DataFrame) -> PredictionResult:
    feat_df = _build_features(df)
    if len(feat_df) < 15:
        raise ValueError("Not enough data to train the model for this range.")

    feature_cols = [
        "lag_1",
        "lag_2",
        "lag_3",
        "rolling_mean_5",
        "rolling_std_5",
        "ma20",
        "ma50",
    ]

    X = feat_df[feature_cols]
    y = feat_df["target"]

    split_idx = int(len(feat_df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    if len(feat_df) < 60:
        model = LinearRegression()
    else:
        model = RandomForestRegressor(n_estimators=300, random_state=42, max_depth=7)
    model.fit(X_train, y_train)

    y_pred_test = model.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_test)))

    comparison = []
    compare_frame = feat_df.iloc[split_idx:].copy()
    compare_frame = compare_frame.tail(30)
    pred_tail = y_pred_test[-len(compare_frame) :]

    for i, row in compare_frame.reset_index(drop=True).iterrows():
        comparison.append(
            {
                "date": row["Date"].strftime("%Y-%m-%d"),
                "actual": float(row["target"]),
                "predicted": float(pred_tail[i]),
            }
        )

    # Iterative 7-day forecast using latest known + predicted closes.
    known_closes = list(df["Close"].astype(float).values)
    last_date = pd.to_datetime(df["Date"].iloc[-1])
    predictions = []

    future_dates = pd.bdate_range(start=last_date + timedelta(days=1), periods=7)

    for step in range(7):
        closes = pd.Series(known_closes)
        row = {
            "lag_1": closes.iloc[-1],
            "lag_2": closes.iloc[-2],
            "lag_3": closes.iloc[-3],
            "rolling_mean_5": closes.iloc[-5:].mean() if len(closes) >= 5 else closes.mean(),
            "rolling_std_5": closes.iloc[-5:].std(ddof=0) if len(closes) >= 5 else closes.std(ddof=0),
            "ma20": closes.iloc[-20:].mean() if len(closes) >= 20 else closes.mean(),
            "ma50": closes.iloc[-50:].mean() if len(closes) >= 50 else closes.mean(),
        }

        next_price = float(model.predict(pd.DataFrame([row]))[0])
        known_closes.append(next_price)
        next_date = future_dates[step].strftime("%Y-%m-%d")
        predictions.append({"date": next_date, "predicted": next_price})

    current_price = float(df["Close"].iloc[-1])
    end_price = predictions[-1]["predicted"]
    move_pct = ((end_price - current_price) / current_price) * 100

    if move_pct > 1.0:
        trend = "Bullish"
    elif move_pct < -1.0:
        trend = "Bearish"
    else:
        trend = "Neutral"

    mean_price = float(np.mean(df["Close"].tail(60)))
    confidence = max(0.0, min(100.0, 100 - (rmse / mean_price) * 100))

    last_ma20 = float(df["Close"].rolling(20).mean().iloc[-1])
    last_ma50 = float(df["Close"].rolling(50).mean().iloc[-1]) if len(df) >= 50 else float(df["Close"].mean())

    explanation = (
        f"The model looks at recent price behavior (lags), short rolling trend, and moving averages. "
        f"It estimates a {move_pct:.2f}% move over the next 7 days, so the outlook is {trend.lower()}. "
        f"Confidence is {confidence:.1f}% based on historical prediction error (RMSE)."
    )

    insights = _extract_insights(current_price, last_ma20, last_ma50, rmse)

    return PredictionResult(
        trend=trend,
        confidence=round(confidence, 2),
        rmse=round(rmse, 4),
        explanation=explanation,
        predictions=predictions,
        comparison=comparison,
        insights=insights,
    )
