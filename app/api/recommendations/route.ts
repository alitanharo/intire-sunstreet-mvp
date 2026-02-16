import { NextResponse } from "next/server";

import { getMarketDataProvider, resolveDataSourceMode } from "@/lib/data-provider";

export async function GET() {
  const source = resolveDataSourceMode();
  const provider = getMarketDataProvider(source);
  const recommendations = await provider.getRecommendations();

  return NextResponse.json({
    source,
    collection: "recommendations",
    count: recommendations.length,
    data: recommendations,
  });
}
