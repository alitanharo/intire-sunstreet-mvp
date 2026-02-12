import { generateAgenticInsight } from "@/lib/agentic-reasoning";
import { getMarketDataProvider } from "@/lib/data-provider";
import {
  deriveTurnoversFromForecast,
  getTopMarketRecommendation,
} from "@/lib/turnover-logic";
import type { DashboardSnapshot } from "@/types/market";

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const provider = getMarketDataProvider();
  const [forecast, recommendations, weather, productionGap] = await Promise.all([
    provider.getForecastSeries(),
    provider.getRecommendations(),
    provider.getWeatherSeries(),
    provider.getProductionGapSeries(),
  ]);

  const turnovers = deriveTurnoversFromForecast(forecast);
  const topRecommendation = getTopMarketRecommendation(forecast);
  const turnover48hSekMw = turnovers.reduce((sum, item) => sum + item.turnoverSekMw, 0);
  const baseline = 0.7 * turnover48hSekMw;
  const revenueAlphaVsBaseline = ((turnover48hSekMw - baseline) / baseline) * 100;
  const reasoning = generateAgenticInsight(forecast, weather, productionGap);

  return {
    generatedAt: new Date().toISOString(),
    forecast,
    turnovers,
    topRecommendation,
    turnover48hSekMw,
    revenueAlphaVsBaseline,
    reasoning,
    recommendations,
  };
}
