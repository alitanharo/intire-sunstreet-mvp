import { NextResponse } from "next/server";

import { getMarketDataProvider } from "@/lib/data-provider";

export async function GET() {
  const provider = getMarketDataProvider();
  const [historicalPrices, timeline, budgetLine, weather, productionGap] = await Promise.all([
    provider.getHistoricalPrices(),
    provider.getTimelineSeries(),
    provider.getBudgetLineSeries(),
    provider.getWeatherSeries(),
    provider.getProductionGapSeries(),
  ]);

  return NextResponse.json({
    source: process.env.DATA_SOURCE ?? "mock",
    tables: {
      historical_prices: historicalPrices,
      hybrid_timeline: timeline,
      budget_line: budgetLine,
      weather_hourly: weather,
      production_gap: productionGap,
    },
  });
}
