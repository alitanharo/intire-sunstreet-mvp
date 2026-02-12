export type AncillaryMarket = "FCR-N" | "FCR-D" | "mFRR" | "Spot";

export interface PredictionDoc {
  time_generated: string;
  prediction_at: string;
  market: AncillaryMarket;
  price: number;
  price_up?: number;
  price_down?: number;
}

export interface RecommendationDoc {
  timestamp: string;
  bid_time_48h: string;
  fcr_split: number;
  mfrr_split: number;
  mfrr_cm_split: number;
  spot_split: number;
}

export interface HistoricalPricePoint {
  timestamp: string;
  market: AncillaryMarket;
  cleared_price: number;
}

export interface WeatherPoint {
  timestamp: string;
  area: "SE3";
  wind_ms: number;
  temperature_c: number;
}

export interface ProductionGapPoint {
  timestamp: string;
  area: "SE3";
  production_mw: number;
  consumption_mw: number;
  gap_mw: number;
}

export interface ForecastSeriesPoint {
  timestamp: string;
  hourLabel: string;
  fcrN: number;
  fcrDUp: number;
  fcrDDown: number;
  mfrr: number;
  spot: number;
}

export interface MarketTurnoverPoint {
  market: AncillaryMarket;
  turnoverSekMw: number;
  trend: "high" | "mid" | "low";
}

export interface ReasoningInsight {
  summary: string;
  strategy: string;
  confidence: "High" | "Medium" | "Low";
  drivers: string[];
}

export interface DashboardSnapshot {
  generatedAt: string;
  forecast: ForecastSeriesPoint[];
  turnovers: MarketTurnoverPoint[];
  topRecommendation: string;
  turnover48hSekMw: number;
  revenueAlphaVsBaseline: number;
  reasoning: ReasoningInsight;
  recommendations: RecommendationDoc[];
}
