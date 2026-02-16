import { generateAgenticInsight } from "@/lib/agentic-reasoning";
import { getMarketDataProvider, resolveDataSourceMode } from "@/lib/data-provider";
import { getSiteById, sites } from "@/lib/sites";
import {
  deriveTurnoversFromForecast,
  getTopMarketRecommendation,
  simulateStrategyPerformance,
} from "@/lib/turnover-logic";
import type { DashboardSnapshot } from "@/types/market";

export async function getDashboardSnapshot(siteId?: string): Promise<DashboardSnapshot> {
  const source = resolveDataSourceMode();
  let provider = getMarketDataProvider(source);
  const activeSite = getSiteById(siteId);
  let connection = await provider.getConnectionStatus();

  if (source === "real" && !connection.connected) {
    provider = getMarketDataProvider("mock");
    connection = {
      ...connection,
      sourceLabel: "Live Firestore (fallback to mock)",
      message: connection.message ?? "Firestore unavailable, running in fallback mode",
    };
  }

  const [forecast, timeline, recommendations, weather, productionGap, latestContext] = await Promise.all([
    provider.getForecastSeries(),
    provider.getTimelineSeries(),
    provider.getRecommendations(),
    provider.getWeatherSeries(),
    provider.getProductionGapSeries(),
    provider.getLatestContextSignal(),
  ]);

  const turnovers = deriveTurnoversFromForecast(forecast, activeSite);
  const topRecommendation = getTopMarketRecommendation(forecast, activeSite);
  const turnover48hSek = turnovers.reduce((sum, item) => sum + item.turnoverSek, 0);
  const strategyComparison = simulateStrategyPerformance(forecast, activeSite);
  const reasoning = generateAgenticInsight(forecast, weather, productionGap, activeSite, latestContext);
  const monthActualRevenue = strategyComparison.totalAiStrategyRevenue * 18;
  const monthBudgetRevenue = timeline.reduce((sum, item) => sum + item.budget, 0) * activeSite.capacity;
  const budgetProgressPct = monthBudgetRevenue
    ? (monthActualRevenue / monthBudgetRevenue) * 100
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    connection,
    activeSite,
    sites,
    forecast,
    timeline,
    turnovers,
    topRecommendation,
    turnover48hSek,
    budgetProgressPct,
    strategyComparison,
    reasoning,
    recommendations,
    latestContext,
  };
}
