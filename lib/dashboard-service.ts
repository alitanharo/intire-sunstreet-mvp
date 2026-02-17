import { generateAgenticInsight } from "@/lib/agentic-reasoning";
import { getMarketDataProvider, resolveDataSourceMode } from "@/lib/data-provider";
import { getSiteById, sites } from "@/lib/sites";
import {
  calculateMarketDominance,
  calculateOptimizedPotential48h,
  calculateHourlyWinningPath,
  deriveTurnoversFromForecast,
  getTopMarketRecommendation,
  simulateStrategyPerformance,
} from "@/lib/turnover-logic";
import type { DashboardSnapshot } from "@/types/market";

export async function getDashboardSnapshot(siteId?: string): Promise<DashboardSnapshot> {
  const source = resolveDataSourceMode();
  const provider = getMarketDataProvider(source);
  const activeSite = getSiteById(siteId);
  const connection = await provider.getConnectionStatus();

  const [forecast, timeline, recommendations, weather, productionGap, latestContext] = await Promise.all([
    provider.getForecastSeries(),
    provider.getTimelineSeries(),
    provider.getRecommendations(),
    provider.getWeatherSeries(),
    provider.getProductionGapSeries(),
    provider.getLatestContextSignal(),
  ]);

  const turnovers = deriveTurnoversFromForecast(forecast, activeSite);
  const dominance = calculateMarketDominance(forecast, activeSite);
  const hourlyWinners = calculateHourlyWinningPath(forecast, activeSite);
  const topRecommendation = getTopMarketRecommendation(forecast, activeSite);
  const turnover48hSek = calculateOptimizedPotential48h(forecast, activeSite);
  const strategyComparison = simulateStrategyPerformance(forecast, activeSite);
  const reasoning = generateAgenticInsight(
    forecast,
    weather,
    productionGap,
    activeSite,
    latestContext,
    hourlyWinners,
  );
  const monthActualRevenue = strategyComparison.totalAiStrategyRevenue * 18;
  const monthBudgetRevenue = timeline.reduce((sum, item) => sum + item.budget, 0) * activeSite.capacity;
  const budgetProgressPct = monthBudgetRevenue
    ? (monthActualRevenue / monthBudgetRevenue) * 100
    : 0;

  const dataGapWarning =
    forecast.length < 48
      ? `Data Gap: expected 48 forecast hours, received ${forecast.length}.`
      : undefined;

  return {
    generatedAt: new Date().toISOString(),
    connection,
    activeSite,
    sites,
    forecast,
    timeline,
    turnovers,
    dominance,
    hourlyWinners,
    topRecommendation,
    turnover48hSek,
    dataGapWarning,
    budgetProgressPct,
    strategyComparison,
    reasoning,
    recommendations,
    latestContext,
  };
}
