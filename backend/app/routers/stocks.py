from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import PredictResponse, StockDataResponse
from app.services.data_service import add_technical_indicators, fetch_stock_history, generate_insights
from app.services.predict_service import run_prediction

router = APIRouter()


@router.get("/stock-data", response_model=StockDataResponse)
def get_stock_data(
    ticker: str = Query(..., description="Stock ticker, e.g. AAPL"),
    range: str = Query("6mo", pattern="^(1mo|6mo|1y)$"),
):
    df = fetch_stock_history(ticker=ticker, range_value=range)
    df = add_technical_indicators(df)

    points = [
        {
            "date": row["Date"].strftime("%Y-%m-%d"),
            "close": float(row["Close"]),
            "ma20": float(row["MA20"]) if row["MA20"] == row["MA20"] else None,
            "ma50": float(row["MA50"]) if row["MA50"] == row["MA50"] else None,
            "volume": int(row["Volume"]),
        }
        for _, row in df.iterrows()
    ]

    return {
        "ticker": ticker.upper(),
        "range": range,
        "points": points,
        "insights": generate_insights(df),
    }


@router.get("/predict", response_model=PredictResponse)
def predict_stock(
    ticker: str = Query(..., description="Stock ticker, e.g. TSLA"),
    range: str = Query("6mo", pattern="^(1mo|6mo|1y)$"),
):
    df = fetch_stock_history(ticker=ticker, range_value=range)

    try:
        prediction_result = run_prediction(df)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "ticker": ticker.upper(),
        "range": range,
        "trend": prediction_result.trend,
        "confidence": prediction_result.confidence,
        "rmse": prediction_result.rmse,
        "explanation": prediction_result.explanation,
        "predictions": prediction_result.predictions,
        "comparison": prediction_result.comparison,
        "insights": prediction_result.insights,
    }
