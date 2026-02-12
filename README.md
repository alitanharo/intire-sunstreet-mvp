# Intire-Sunstreet-MVP

High-performance Energy Bidding Optimization platform for Independent Power Producers (IPPs) in Sweden.

Focus area: **SE3 (Stockholm)**.  
Goal: predict and recommend the most profitable market across **FCR-N, FCR-D, mFRR, Spot** on a 48-hour horizon.

---

## Tech Stack (latest stable)

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Nivo Treemap** (Pulse Heatmap)
- **Recharts** (48h Forecast chart)
- **lucide-react** icons
- **Firebase SDK** and **BigQuery SDK** included for real-data integration

---

## Business Logic (Critical)

Implemented in: `lib/turnover-logic.ts`

Constants:
- `EURO_TO_SEK = 11`
- `FCR_D_CAPACITY_FACTOR = 0.83`
- `FCR_N_CAPACITY_FACTOR = 0.45`
- `MFRR_ACTIVATION_BONUS = 1.2`

Formulas:
- **FCR-D Turnover:** `(Price_Up + Price_Down) * 0.83 * 11`
- **FCR-N Turnover:** `Price * 0.45 * 11`
- **mFRR Turnover:** `Price * 0.83 * 11 * 1.2`
- **Spot Arbitrage Rule:** If `(Daily_Max_Price - Daily_Min_Price) * 11 > Calculated_24h_FCR_Profit` then recommend **"SPOT MARKET"**

All dashboard market sizing and recommendation logic uses these conversions to display **True Turnover (SEK/MW)**.

---

## Data Architecture (Firestore-first mock, BigQuery-ready)

### Firestore-shaped collections (mocked in `data/mockData.ts`)

- `predictions`
  - `time_generated`
  - `prediction_at`
  - `market`
  - `price`
  - optional `price_up`, `price_down` for FCR-D

- `recommendations`
  - `timestamp`
  - `bid_time_48h`
  - `fcr_split`
  - `mfrr_split`
  - `mfrr_cm_split`
  - `spot_split`

### BigQuery-shaped context (mocked for reasoning)

- historical prices
- weather (wind/temp)
- production gap (production - consumption)

Provider abstraction:
- `lib/data-provider.ts`
  - `MockMarketDataProvider` (default)
  - `RealMarketDataProvider` (stubbed for production wiring)

Use `DATA_SOURCE=mock|real` to switch.

---

## Implemented UI Components

- **KPI Cards**
  - Top Market Recommendation
  - Predicted 48h Turnover
  - Revenue Alpha vs Baseline

- **The Pulse Heatmap** (`components/pulse-heatmap.tsx`)
  - Treemap of FCR-N, FCR-D, mFRR, Spot
  - Box size = SEK turnover
  - Color = profitability trend

- **The 48H Forecast Chart** (`components/forecast-chart.tsx`)
  - Multi-line chart for ancillary/spot predictions

- **Agentic Pilot** (`components/agentic-pilot.tsx`)
  - Human-readable AI strategy insight
  - Combines forecast + weather + production gap logic

Theme: **Deep Grid** (dark slate/blues + neon green profit accents + amber warnings)

---

## API Routes

- `GET /api/predictions`
- `GET /api/recommendations`
- `GET /api/history`

All return mock JSON by default, while maintaining a clear path for Firestore/BigQuery production integration.

---

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Update values as needed

```bash
copy .env.example .env.local
```

Key envs:
- `DATA_SOURCE=mock` (default)
- Firebase placeholders (for real Firestore mode)
- BigQuery placeholders (for real BigQuery mode)

---

## Run Locally

```bash
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## Build & Lint

```bash
npm run lint
npm run build
```

---

## Deployment

Deploy on Vercel with environment variables configured for your selected data mode.

