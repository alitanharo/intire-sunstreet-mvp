import {
  forecastSeries,
  historicalPrices,
  predictions,
  productionGapSeries,
  recommendations,
  weatherSeries,
} from "@/data/mockData";
import type {
  ForecastSeriesPoint,
  HistoricalPricePoint,
  PredictionDoc,
  ProductionGapPoint,
  RecommendationDoc,
  WeatherPoint,
} from "@/types/market";

export interface MarketDataProvider {
  getPredictions(): Promise<PredictionDoc[]>;
  getRecommendations(): Promise<RecommendationDoc[]>;
  getForecastSeries(): Promise<ForecastSeriesPoint[]>;
  getHistoricalPrices(): Promise<HistoricalPricePoint[]>;
  getWeatherSeries(): Promise<WeatherPoint[]>;
  getProductionGapSeries(): Promise<ProductionGapPoint[]>;
}

class MockMarketDataProvider implements MarketDataProvider {
  async getPredictions() {
    return predictions;
  }

  async getRecommendations() {
    return recommendations;
  }

  async getForecastSeries() {
    return forecastSeries;
  }

  async getHistoricalPrices() {
    return historicalPrices;
  }

  async getWeatherSeries() {
    return weatherSeries;
  }

  async getProductionGapSeries() {
    return productionGapSeries;
  }
}

class RealMarketDataProvider implements MarketDataProvider {
  private notConfigured(resource: string): never {
    throw new Error(
      `${resource} real data source is not configured yet. Switch DATA_SOURCE=mock or wire Firestore/BigQuery credentials.`,
    );
  }

  async getPredictions() {
    return this.notConfigured("predictions");
  }
  async getRecommendations() {
    return this.notConfigured("recommendations");
  }
  async getForecastSeries() {
    return this.notConfigured("forecastSeries");
  }
  async getHistoricalPrices() {
    return this.notConfigured("historicalPrices");
  }
  async getWeatherSeries() {
    return this.notConfigured("weatherSeries");
  }
  async getProductionGapSeries() {
    return this.notConfigured("productionGapSeries");
  }
}

export function getMarketDataProvider(): MarketDataProvider {
  const source = process.env.DATA_SOURCE ?? "mock";
  return source === "real" ? new RealMarketDataProvider() : new MockMarketDataProvider();
}
