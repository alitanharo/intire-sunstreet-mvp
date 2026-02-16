export type AncillaryMarket = "FCR-N" | "FCR-D" | "mFRR" | "Spot";
export type SiteStatus = "charging" | "discharging" | "idle";

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

export interface TimelinePoint {
  timestamp: string;
  label: string;
  kind: "historical" | "forecast";
  isNowMarker?: boolean;
  fcrN: number;
  fcrDUp: number;
  fcrDDown: number;
  mfrr: number;
  spot: number;
  budget: number;
}

export interface ContextSignal {
  timestamp: string;
  prodConsGap: number;
  temp: number;
  windSpeed: number;
}

export interface DataConnectionStatus {
  mode: "mock" | "real";
  connected: boolean;
  sourceLabel: string;
  message?: string;
}

export interface BudgetLinePoint {
  timestamp: string;
  budget: number;
}

export interface SiteConfig {
  id: string;
  name: string;
  capacity: number;
  type: string;
  soc: number;
  status: SiteStatus;
  livePowerMw: number;
}

export interface MarketTurnoverPoint {
  market: AncillaryMarket;
  turnoverSek: number;
  trend: "high" | "mid" | "low";
}

export interface StrategyComparison {
  totalAiStrategyRevenue: number;
  staticFcrnRevenue: number;
  revenueAlphaPct: number;
}

export interface ReasoningInsight {
  summary: string;
  strategy: string;
  confidence: "High" | "Medium" | "Low";
  confidenceScore: number;
  drivers: string[];
}

export interface DashboardSnapshot {
  generatedAt: string;
  connection: DataConnectionStatus;
  activeSite: SiteConfig;
  sites: SiteConfig[];
  forecast: ForecastSeriesPoint[];
  timeline: TimelinePoint[];
  turnovers: MarketTurnoverPoint[];
  topRecommendation: string;
  turnover48hSek: number;
  budgetProgressPct: number;
  strategyComparison: StrategyComparison;
  reasoning: ReasoningInsight;
  recommendations: RecommendationDoc[];
  latestContext?: ContextSignal;
}
