from pydantic import BaseModel
from typing import List, Optional


class PricePoint(BaseModel):
    date: str
    close: float
    ma20: Optional[float] = None
    ma50: Optional[float] = None
    volume: int


class StockDataResponse(BaseModel):
    ticker: str
    range: str
    points: List[PricePoint]
    insights: List[str]


class PredictionPoint(BaseModel):
    date: str
    predicted: float


class ComparisonPoint(BaseModel):
    date: str
    actual: float
    predicted: float


class PredictResponse(BaseModel):
    ticker: str
    range: str
    trend: str
    confidence: float
    rmse: float
    explanation: str
    predictions: List[PredictionPoint]
    comparison: List[ComparisonPoint]
    insights: List[str]
