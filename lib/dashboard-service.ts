import { generateAgenticInsight } from "@/lib/agentic-reasoning";
import { getMarketDataProvider } from "@/lib/data-provider";
import { getSiteById, sites } from "@/lib/sites";
import {
  deriveTurnoversFromForecast,
  getTopMarketRecommendation,
  simulateStrategyPerformance,
} from "@/lib/turnover-logic";
import type { DashboardSnapshot } from "@/types/market";

export async function getDashboardSnapshot(siteId?: string): Promise<DashboardSnapshot> {
  const provider = getMarketDataProvider();
  const activeSite = getSiteById(siteId);

  const [forecast, timeline, recommendations, weather, productionGap] = await Promise.all([
    provider.getForecastSeries(),
    provider.getTimelineSeries(),
    provider.getRecommendations(),
    provider.getWeatherSeries(),
    provider.getProductionGapSeries(),
  ]);

  const turnovers = deriveTurnoversFromForecast(forecast, activeSite);
  const topRecommendation = getTopMarketRecommendation(forecast, activeSite);
  const turnover48hSek = turnovers.reduce((sum, item) => sum + item.turnoverSek, 0);
  const strategyComparison = simulateStrategyPerformance(forecast, activeSite);
  const reasoning = generateAgenticInsight(forecast, weather, productionGap, activeSite);
  const monthActualRevenue = strategyComparison.totalAiStrategyRevenue * 18;
  const monthBudgetRevenue = timeline.reduce((sum, item) => sum + item.budget, 0) * activeSite.capacity;
  const budgetProgressPct = monthBudgetRevenue
    ? (monthActualRevenue / monthBudgetRevenue) * 100
    : 0;

  return {
    generatedAt: new Date().toISOString(),
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
  };
}
