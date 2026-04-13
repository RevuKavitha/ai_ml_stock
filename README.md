# AI Stock Price Predictor and Analyzer

Full-stack application with:
- `frontend`: Next.js (App Router) + Tailwind CSS + Recharts
- `backend`: FastAPI + Pandas + NumPy + Scikit-learn + yfinance

## Folder Structure

```text
ai_ml_stock/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── routers/
│   │   │   └── stocks.py
│   │   └── services/
│   │       ├── data_service.py
│   │       └── predict_service.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── PredictionChart.tsx
│   │   ├── PriceChart.tsx
│   │   ├── StockControls.tsx
│   │   ├── TrendCard.tsx
│   │   └── VolumeChart.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── README.md
```

## Backend Setup (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API runs at `http://localhost:8000`

### Backend Endpoints

- `GET /stock-data?ticker=AAPL&range=6mo`
  - Fetches historical data from yfinance
  - Returns close, MA20, MA50, volume, and insights
- `GET /predict?ticker=AAPL&range=6mo`
  - Trains RandomForest on time-series features (lags + rolling stats + moving averages)
  - Returns 7-day predicted prices, trend label, confidence score, RMSE, explanation, and actual-vs-predicted comparison

Supported `range`: `1mo`, `6mo`, `1y`

## Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

UI runs at `http://localhost:3000`

Optional env override:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## ML Logic Summary

- Time-series feature engineering includes:
  - Lag values (`lag_1`, `lag_2`, `lag_3`)
  - Rolling mean/std (5-day)
  - Moving averages (`ma20`, `ma50`)
- Target is next-day close (`Close.shift(-1)`)
- Split uses chronological train/test (`80/20`) to avoid data leakage
- Evaluation metric: RMSE on holdout period
- 7-day forecast uses iterative prediction, feeding each predicted value into future feature generation

## Features Implemented

- Stock selector (dropdown + manual ticker input)
- Time range selector (`1mo`, `6mo`, `1y`)
- Price trend chart with MA20/MA50 overlays
- Volume chart
- Prediction chart (actual vs predicted + forecast)
- Trend tag (Bullish/Bearish/Neutral)
- Confidence score + RMSE
- “Why this prediction?” explanation in plain language
- Key insights panel (including MA50 signal)
- Loading and error states
- Responsive dashboard layout
