import fs from "node:fs";
import path from "node:path";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { calculateHourlyWinningPath, getTopMarketRecommendation } from "@/lib/turnover-logic";
import { getSiteById } from "@/lib/sites";
import type {
  ContextSignal,
  DataConnectionStatus,
  ForecastSeriesPoint,
  BudgetLinePoint,
  HistoricalPricePoint,
  PredictionDoc,
  ProductionGapPoint,
  RecommendationDoc,
  TimelinePoint,
  WeatherPoint,
} from "@/types/market";
import type { Timestamp } from "firebase-admin/firestore";

export type DataSourceMode = "mock" | "real";

function hasFirebaseCredentials() {
  const fileCandidates = ["serviceaccount.json", "serviceaccount-key.json"];
  const hasFile = fileCandidates.some((file) => fs.existsSync(path.join(process.cwd(), file)));

  const hasEnv =
    !!process.env.FIREBASE_PROJECT_ID &&
    !!process.env.FIREBASE_CLIENT_EMAIL &&
    !!process.env.FIREBASE_PRIVATE_KEY;

  return hasFile || hasEnv;
}

export function resolveDataSourceMode(): DataSourceMode {
  const configured = (process.env.DATA_SOURCE ?? "real").toLowerCase();

  if (configured === "mock") {
    throw new Error("Mock mode is disabled in V8. Set DATA_SOURCE=real.");
  }

  if (!hasFirebaseCredentials()) {
    throw new Error(
      "Strict real-data mode requires Firebase credentials. Set FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY or provide a service account file.",
    );
  }

  return "real";
}

type MarketTimelineDoc = {
  timestamp: Timestamp | Date | string;
  is_forecast: boolean;
  prices?: {
    fcr_d_up?: number;
    fcr_d_down?: number;
    fcr_n?: number;
    mfrr?: number;
    spot?: number;
  };
  context?: {
    prod_cons_gap?: number;
    temp?: number;
    wind_speed?: number;
  };
};

function asDate(value: MarketTimelineDoc["timestamp"]): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return new Date();
}

function toTimelinePoint(doc: MarketTimelineDoc): TimelinePoint {
  const date = asDate(doc.timestamp);

  return {
    timestamp: date.toISOString(),
    label: date.toLocaleString("sv-SE", { month: "2-digit", day: "2-digit", hour: "2-digit" }),
    kind: doc.is_forecast ? "forecast" : "historical",
    fcrN: Number(doc.prices?.fcr_n ?? 0),
    fcrDUp: Number(doc.prices?.fcr_d_up ?? 0),
    fcrDDown: Number(doc.prices?.fcr_d_down ?? 0),
    mfrr: Number(doc.prices?.mfrr ?? 0),
    spot: Number(doc.prices?.spot ?? 0),
    budget: Number(doc.prices?.spot ?? 0) * 0.72,
  };
}

export interface MarketDataProvider {
  getPredictions(): Promise<PredictionDoc[]>;
  getRecommendations(): Promise<RecommendationDoc[]>;
  getForecastSeries(): Promise<ForecastSeriesPoint[]>;
  getTimelineSeries(): Promise<TimelinePoint[]>;
  getBudgetLineSeries(): Promise<BudgetLinePoint[]>;
  getHistoricalPrices(): Promise<HistoricalPricePoint[]>;
  getWeatherSeries(): Promise<WeatherPoint[]>;
  getProductionGapSeries(): Promise<ProductionGapPoint[]>;
  getLatestContextSignal(): Promise<ContextSignal | undefined>;
  getConnectionStatus(): Promise<DataConnectionStatus>;
}

class RealMarketDataProvider implements MarketDataProvider {
  private marketTimelinePromise?: Promise<{ historical: MarketTimelineDoc[]; forecast: MarketTimelineDoc[] }>;

  private async fetchMarketTimeline() {
    if (this.marketTimelinePromise) {
      return this.marketTimelinePromise;
    }

    this.marketTimelinePromise = (async () => {
      const db = getAdminFirestore();
      const snapshot = await db.collection("market_timeline").orderBy("timestamp", "desc").limit(500).get();

      const rows = snapshot.docs.map((doc) => doc.data() as MarketTimelineDoc);

      const historical = rows
        .filter((row) => !row.is_forecast)
        .slice(0, 168)
        .sort((a, b) => asDate(a.timestamp).getTime() - asDate(b.timestamp).getTime());

      const forecast = rows
        .filter((row) => row.is_forecast)
        .slice(0, 48)
        .sort((a, b) => asDate(a.timestamp).getTime() - asDate(b.timestamp).getTime());

      return { historical, forecast };
    })();

    return this.marketTimelinePromise;
  }

  async getPredictions() {
    const { forecast } = await this.fetchMarketTimeline();
    const generatedAt = new Date().toISOString();

    return forecast.flatMap((row) => {
      const predictionAt = asDate(row.timestamp).toISOString();
      const fcrDUp = Number(row.prices?.fcr_d_up ?? 0);
      const fcrDDown = Number(row.prices?.fcr_d_down ?? 0);

      return [
        { time_generated: generatedAt, prediction_at: predictionAt, market: "FCR-N" as const, price: Number(row.prices?.fcr_n ?? 0) },
        {
          time_generated: generatedAt,
          prediction_at: predictionAt,
          market: "FCR-D" as const,
          price: fcrDUp + fcrDDown,
          price_up: fcrDUp,
          price_down: fcrDDown,
        },
        { time_generated: generatedAt, prediction_at: predictionAt, market: "mFRR" as const, price: Number(row.prices?.mfrr ?? 0) },
        { time_generated: generatedAt, prediction_at: predictionAt, market: "Spot" as const, price: Number(row.prices?.spot ?? 0) },
      ];
    });
  }

  async getRecommendations() {
    const db = getAdminFirestore();
    const recommendationSnapshot = await db
      .collection("recommendations")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    const persisted = recommendationSnapshot.docs[0]?.data() as RecommendationDoc | undefined;
    if (persisted) {
      return [persisted];
    }

    const forecast = await this.getForecastSeries();
    const site = getSiteById();
    const topMarket = getTopMarketRecommendation(forecast, site);
    const winners = calculateHourlyWinningPath(forecast, site);
    const winnerCounts = winners.reduce(
      (acc, point) => {
        if (point.market === "FCR-D") acc.fcr += 1;
        if (point.market === "mFRR") acc.mfrr += 1;
        if (point.market === "Spot") acc.spot += 1;
        return acc;
      },
      { fcr: 0, mfrr: 0, spot: 0 },
    );
    const winnerTotal = Math.max(winners.length, 1);
    const dynamicSplit = {
      fcr_split: winnerCounts.fcr / winnerTotal,
      mfrr_split: winnerCounts.mfrr / winnerTotal,
      mfrr_cm_split: Math.min(0.2, winnerCounts.mfrr / winnerTotal / 2),
      spot_split: winnerCounts.spot / winnerTotal,
    };

    const splitMap = {
      "FCR-D": { fcr_split: 0.58, mfrr_split: 0.24, mfrr_cm_split: 0.1, spot_split: 0.08 },
      mFRR: { fcr_split: 0.37, mfrr_split: 0.43, mfrr_cm_split: 0.12, spot_split: 0.08 },
      "FCR-N": { fcr_split: 0.62, mfrr_split: 0.18, mfrr_cm_split: 0.08, spot_split: 0.12 },
      "SPOT MARKET": { fcr_split: 0.24, mfrr_split: 0.2, mfrr_cm_split: 0.08, spot_split: 0.48 },
      Spot: { fcr_split: 0.24, mfrr_split: 0.2, mfrr_cm_split: 0.08, spot_split: 0.48 },
    } as const;

    const split =
      winnerCounts.fcr + winnerCounts.mfrr + winnerCounts.spot > 0
        ? dynamicSplit
        : splitMap[topMarket as keyof typeof splitMap] ?? splitMap["FCR-D"];

    return [
      {
        timestamp: new Date().toISOString(),
        bid_time_48h: forecast.at(-1)?.timestamp ?? new Date().toISOString(),
        ...split,
      },
    ];
  }

  async getForecastSeries() {
    const { forecast } = await this.fetchMarketTimeline();

    return forecast.map((doc) => {
      const date = asDate(doc.timestamp);
      return {
        timestamp: date.toISOString(),
        hourLabel: date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }),
        fcrN: Number(doc.prices?.fcr_n ?? 0),
        fcrDUp: Number(doc.prices?.fcr_d_up ?? 0),
        fcrDDown: Number(doc.prices?.fcr_d_down ?? 0),
        mfrr: Number(doc.prices?.mfrr ?? 0),
        spot: Number(doc.prices?.spot ?? 0),
      };
    });
  }

  async getTimelineSeries() {
    const { historical, forecast } = await this.fetchMarketTimeline();
    const timeline = [...historical.map(toTimelinePoint), ...forecast.map(toTimelinePoint)];

    const nowBoundary = timeline.findIndex((point) => point.kind === "forecast");
    if (nowBoundary > 0) {
      timeline[nowBoundary - 1] = { ...timeline[nowBoundary - 1], isNowMarker: true };
    }

    return timeline;
  }

  async getBudgetLineSeries() {
    const timeline = await this.getTimelineSeries();
    return timeline.map((point) => ({ timestamp: point.timestamp, budget: point.budget }));
  }

  async getHistoricalPrices() {
    const { historical } = await this.fetchMarketTimeline();

    return historical.flatMap((doc) => {
      const timestamp = asDate(doc.timestamp).toISOString();
      return [
        { timestamp, market: "FCR-N" as const, cleared_price: Number(doc.prices?.fcr_n ?? 0) },
        {
          timestamp,
          market: "FCR-D" as const,
          cleared_price: Number(doc.prices?.fcr_d_up ?? 0) + Number(doc.prices?.fcr_d_down ?? 0),
        },
        { timestamp, market: "mFRR" as const, cleared_price: Number(doc.prices?.mfrr ?? 0) },
        { timestamp, market: "Spot" as const, cleared_price: Number(doc.prices?.spot ?? 0) },
      ];
    });
  }

  async getWeatherSeries() {
    const timeline = await this.getTimelineSeries();
    const { historical, forecast } = await this.fetchMarketTimeline();
    const rows = [...historical, ...forecast]
      .sort((a, b) => asDate(a.timestamp).getTime() - asDate(b.timestamp).getTime())
      .slice(0, timeline.length);

    return rows.map((doc) => ({
      timestamp: asDate(doc.timestamp).toISOString(),
      area: "SE3" as const,
      wind_ms: Number(doc.context?.wind_speed ?? 0),
      temperature_c: Number(doc.context?.temp ?? 0),
    }));
  }

  async getProductionGapSeries() {
    const { historical, forecast } = await this.fetchMarketTimeline();
    const rows = [...historical, ...forecast].sort(
      (a, b) => asDate(a.timestamp).getTime() - asDate(b.timestamp).getTime(),
    );

    return rows.map((doc) => {
      const gap = Number(doc.context?.prod_cons_gap ?? 0);
      const production = 8600 + gap / 2;
      const consumption = production - gap;

      return {
        timestamp: asDate(doc.timestamp).toISOString(),
        area: "SE3" as const,
        production_mw: production,
        consumption_mw: consumption,
        gap_mw: gap,
      };
    });
  }

  async getLatestContextSignal() {
    const db = getAdminFirestore();
    const snapshot = await db.collection("market_timeline").orderBy("timestamp", "desc").limit(1).get();
    const doc = snapshot.docs[0]?.data() as MarketTimelineDoc | undefined;

    if (!doc?.context) return undefined;

    return {
      timestamp: asDate(doc.timestamp).toISOString(),
      prodConsGap: Number(doc.context.prod_cons_gap ?? 0),
      temp: Number(doc.context.temp ?? 0),
      windSpeed: Number(doc.context.wind_speed ?? 0),
    };
  }

  async getConnectionStatus() {
    try {
      await this.fetchMarketTimeline();
      return {
        mode: "real",
        connected: true,
        sourceLabel: "Live Firestore",
      } satisfies DataConnectionStatus;
    } catch (error) {
      return {
        mode: "real",
        connected: false,
        sourceLabel: "Live Firestore",
        message: error instanceof Error ? error.message : "Connection failed",
      } satisfies DataConnectionStatus;
    }
  }
}

export function getMarketDataProvider(sourceOverride?: DataSourceMode): MarketDataProvider {
  const source = sourceOverride ?? resolveDataSourceMode();
  if (source !== "real") {
    throw new Error("Mock provider is disabled in strict real-data mode.");
  }

  return new RealMarketDataProvider();
}
