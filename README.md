# Intire-Sunstreet-MVP

High-performance Energy Bidding Optimization platform for Independent Power Producers (IPPs) in Sweden.

Focus area: **SE3 (Stockholm)**.  
Goal: predict and recommend the most profitable market across **FCR-N, FCR-D, mFRR, Spot** on a 48-hour horizon.

This repo is now upgraded to an operational **V3 dashboard**: site-aware strategy engine, hybrid timeline (7d history + 48h forecast), budget tracking, confidence scoring, and a tightly-packed professional market heatmap.

---

## Tech Stack (latest stable)

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Nivo Treemap** (Pulse Heatmap)
- **Recharts** (Hybrid Timeline + budget line)
- **Framer Motion** (smooth site-switch transitions)
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

All dashboard market sizing and recommendation logic uses these conversions to display **True Turnover**, then scales by selected site capacity for **actual predicted revenue (SEK)**.

Additional simulator logic:
- **AI Strategy Revenue** vs **Static FCR-N Baseline**
- Static baseline holds fixed **45% capacity** regardless of market spikes.

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

## Implemented UI Components (V3)

- **Global Site Selector + Live Telemetry**
  - Active site selection via URL param (`?site=1011`)
  - Live badge with SOC/status/power and animated charging/discharging states

- **KPI Cards**
  - Top Market Recommendation (pulse highlight when FCR-D)
  - Predicted 48h Turnover (site-scaled SEK)
  - Revenue Alpha vs Baseline
  - Month Progress vs Budget (%)

- **Pulse Heatmap** (`components/pulse-heatmap.tsx`)
  - Tightly-packed professional market mosaic (no wasted space)
  - Operational market intensity by true turnover (SEK)
  - Per-market share percentage label

- **Hybrid Timeline Chart** (`components/hybrid-timeline-chart.tsx`)
  - Past 7 days + next 48 hours
  - NOW marker
  - Ancillary toggles (FCR-D Up/Down, FCR-N, mFRR, Spot)
  - **Budget per hour line**

- **Alpha Strategy Comparison**
  - AI Optimized vs FCR-N Standard bars
  - Revenue alpha emphasis

- **Agentic Pilot V2**
  - Site-aware reasoning recommendations
  - Confidence label + numeric confidence score (0-100%)

Theme: **Deep Grid** (dark slate/blues + neon green profit accents + amber warnings)

---

## API Routes

- `GET /api/predictions`
- `GET /api/recommendations`
- `GET /api/history`

`/api/history` now includes:
- `historical_prices`
- `hybrid_timeline`
- `budget_line`
- `weather_hourly`
- `production_gap`

All routes return mock JSON by default, while maintaining a clear path for Firestore/BigQuery production integration.

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

