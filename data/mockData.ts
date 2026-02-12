import {
  type ForecastSeriesPoint,
  type HistoricalPricePoint,
  type PredictionDoc,
  type ProductionGapPoint,
  type RecommendationDoc,
  type WeatherPoint,
} from "@/types/market";

const NOW = new Date();

function toIso(date: Date) {
  return date.toISOString();
}

function plusHours(base: Date, hours: number) {
  const copy = new Date(base);
  copy.setHours(copy.getHours() + hours);
  return copy;
}

function round(value: number, precision = 2) {
  const p = 10 ** precision;
  return Math.round(value * p) / p;
}

export const forecastSeries: ForecastSeriesPoint[] = Array.from(
  { length: 48 },
  (_, index) => {
    const timestamp = plusHours(NOW, index + 1);
    const cycle = Math.sin(index / 5);
    const highRiskPulse = index > 16 && index < 28 ? 18 : 0;

    return {
      timestamp: toIso(timestamp),
      hourLabel: timestamp.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fcrN: round(16 + cycle * 3 + highRiskPulse * 0.2),
      fcrDUp: round(24 + cycle * 4 + highRiskPulse * 0.5),
      fcrDDown: round(12 + cycle * 2 + highRiskPulse * 0.25),
      mfrr: round(28 + cycle * 6 + highRiskPulse * 0.65),
      spot: round(34 + Math.cos(index / 4) * 7 + highRiskPulse * 0.15),
    };
  },
);

export const predictions: PredictionDoc[] = forecastSeries.flatMap((point) => {
  const generatedAt = toIso(NOW);

  return [
    {
      time_generated: generatedAt,
      prediction_at: point.timestamp,
      market: "FCR-N",
      price: point.fcrN,
    },
    {
      time_generated: generatedAt,
      prediction_at: point.timestamp,
      market: "FCR-D",
      price: round(point.fcrDUp + point.fcrDDown),
      price_up: point.fcrDUp,
      price_down: point.fcrDDown,
    },
    {
      time_generated: generatedAt,
      prediction_at: point.timestamp,
      market: "mFRR",
      price: point.mfrr,
    },
    {
      time_generated: generatedAt,
      prediction_at: point.timestamp,
      market: "Spot",
      price: point.spot,
    },
  ];
});

export const recommendations: RecommendationDoc[] = [
  {
    timestamp: toIso(NOW),
    bid_time_48h: toIso(plusHours(NOW, 48)),
    fcr_split: 0.46,
    mfrr_split: 0.28,
    mfrr_cm_split: 0.14,
    spot_split: 0.12,
  },
];

export const weatherSeries: WeatherPoint[] = Array.from({ length: 48 }, (_, i) => {
  const t = plusHours(NOW, i + 1);
  return {
    timestamp: toIso(t),
    area: "SE3",
    wind_ms: round(3.8 + Math.sin(i / 6) * 1.7 - (i > 18 && i < 30 ? 1.2 : 0), 1),
    temperature_c: round(-2 + Math.cos(i / 8) * 4 - (i > 20 && i < 32 ? 2.5 : 0), 1),
  };
});

export const productionGapSeries: ProductionGapPoint[] = Array.from(
  { length: 48 },
  (_, i) => {
    const t = plusHours(NOW, i + 1);
    const production = 8350 + Math.cos(i / 5) * 620 - (i > 17 && i < 31 ? 520 : 0);
    const consumption = 8720 + Math.sin(i / 4) * 540 + (i > 17 && i < 31 ? 680 : 0);

    return {
      timestamp: toIso(t),
      area: "SE3",
      production_mw: round(production, 0),
      consumption_mw: round(consumption, 0),
      gap_mw: round(production - consumption, 0),
    };
  },
);

export const historicalPrices: HistoricalPricePoint[] = forecastSeries
  .slice(0, 24)
  .flatMap((point) => [
    { timestamp: point.timestamp, market: "FCR-N" as const, cleared_price: point.fcrN - 2 },
    {
      timestamp: point.timestamp,
      market: "FCR-D" as const,
      cleared_price: point.fcrDUp + point.fcrDDown - 3,
    },
    { timestamp: point.timestamp, market: "mFRR" as const, cleared_price: point.mfrr - 2 },
    { timestamp: point.timestamp, market: "Spot" as const, cleared_price: point.spot - 1 },
  ]);
