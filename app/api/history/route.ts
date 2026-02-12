import { NextResponse } from "next/server";

import { getMarketDataProvider } from "@/lib/data-provider";

export async function GET() {
  const provider = getMarketDataProvider();
  const [historicalPrices, weather, productionGap] = await Promise.all([
    provider.getHistoricalPrices(),
    provider.getWeatherSeries(),
    provider.getProductionGapSeries(),
  ]);

  return NextResponse.json({
    source: process.env.DATA_SOURCE ?? "mock",
    tables: {
      historical_prices: historicalPrices,
      weather_hourly: weather,
      production_gap: productionGap,
    },
  });
}
