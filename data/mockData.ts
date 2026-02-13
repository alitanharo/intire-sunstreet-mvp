import {
  type BudgetLinePoint,
  type ForecastSeriesPoint,
  type HistoricalPricePoint,
  type PredictionDoc,
  type ProductionGapPoint,
  type RecommendationDoc,
  type TimelinePoint,
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

function buildPriceVector(date: Date, horizonShift = 0) {
  const hour = date.getHours();
  const dayCycle = Math.sin((hour / 24) * Math.PI * 2);
  const weeklyCycle = Math.sin((date.getDate() + horizonShift) / 3.2);
  const eveningSpike = hour >= 17 && hour <= 20 ? 8.5 : 0;

  return {
    fcrN: round(15 + dayCycle * 2 + weeklyCycle * 1.6),
    fcrDUp: round(23 + dayCycle * 3 + weeklyCycle * 2.2 + eveningSpike),
    fcrDDown: round(12 + dayCycle * 1.4 + weeklyCycle * 1.2 + eveningSpike * 0.35),
    mfrr: round(27 + dayCycle * 4.5 + weeklyCycle * 2.5 + eveningSpike * 0.75),
    spot: round(33 + dayCycle * 5 + weeklyCycle * 2.1 + eveningSpike * 0.25),
  };
}

function buildBudgetValue(date: Date) {
  const hour = date.getHours();
  const peakAdder = hour >= 17 && hour <= 21 ? 6.4 : 0;
  return round(24 + Math.sin((hour / 24) * Math.PI * 2) * 2.6 + peakAdder);
}

export const historicalTimeline: TimelinePoint[] = Array.from({ length: 24 * 7 }, (_, i) => {
  const date = plusHours(NOW, -(24 * 7 - 1 - i));
  const vector = buildPriceVector(date, -2);

  return {
    timestamp: toIso(date),
    label: date.toLocaleString("sv-SE", { month: "2-digit", day: "2-digit", hour: "2-digit" }),
    kind: "historical",
    isNowMarker: i === 24 * 7 - 1,
    budget: buildBudgetValue(date),
    ...vector,
  };
});

export const forecastSeries: ForecastSeriesPoint[] = Array.from({ length: 48 }, (_, index) => {
  const timestamp = plusHours(NOW, index + 1);
  const vector = buildPriceVector(timestamp, 4);

  return {
    timestamp: toIso(timestamp),
    hourLabel: timestamp.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    ...vector,
  };
});

export const forecastTimeline: TimelinePoint[] = forecastSeries.map((point) => ({
  timestamp: point.timestamp,
  label: new Date(point.timestamp).toLocaleString("sv-SE", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
  }),
  kind: "forecast",
  budget: buildBudgetValue(new Date(point.timestamp)),
  fcrN: point.fcrN,
  fcrDUp: point.fcrDUp,
  fcrDDown: point.fcrDDown,
  mfrr: point.mfrr,
  spot: point.spot,
}));

export const timelineSeries: TimelinePoint[] = [...historicalTimeline, ...forecastTimeline];

export const budgetLine: BudgetLinePoint[] = timelineSeries.map((point) => ({
  timestamp: point.timestamp,
  budget: point.budget,
}));

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
    fcr_split: 0.52,
    mfrr_split: 0.24,
    mfrr_cm_split: 0.12,
    spot_split: 0.12,
  },
];

export const weatherSeries: WeatherPoint[] = Array.from({ length: 48 }, (_, i) => {
  const t = plusHours(NOW, i + 1);
  return {
    timestamp: toIso(t),
    area: "SE3",
    wind_ms: round(3.5 + Math.sin(i / 5) * 1.6 - (i > 17 && i < 30 ? 1.1 : 0), 1),
    temperature_c: round(-1.8 + Math.cos(i / 8) * 4 - (i > 20 && i < 33 ? 2.3 : 0), 1),
  };
});

export const productionGapSeries: ProductionGapPoint[] = Array.from({ length: 48 }, (_, i) => {
  const t = plusHours(NOW, i + 1);
  const production = 8350 + Math.cos(i / 5) * 600 - (i > 17 && i < 31 ? 540 : 0);
  const consumption = 8720 + Math.sin(i / 4) * 560 + (i > 17 && i < 31 ? 700 : 0);

  return {
    timestamp: toIso(t),
    area: "SE3",
    production_mw: round(production, 0),
    consumption_mw: round(consumption, 0),
    gap_mw: round(production - consumption, 0),
  };
});

export const historicalPrices: HistoricalPricePoint[] = historicalTimeline.flatMap((point) => [
  { timestamp: point.timestamp, market: "FCR-N" as const, cleared_price: point.fcrN },
  {
    timestamp: point.timestamp,
    market: "FCR-D" as const,
    cleared_price: point.fcrDUp + point.fcrDDown,
  },
  { timestamp: point.timestamp, market: "mFRR" as const, cleared_price: point.mfrr },
  { timestamp: point.timestamp, market: "Spot" as const, cleared_price: point.spot },
]);
