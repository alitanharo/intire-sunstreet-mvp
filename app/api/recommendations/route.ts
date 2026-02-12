import { NextResponse } from "next/server";

import { getMarketDataProvider } from "@/lib/data-provider";

export async function GET() {
  const provider = getMarketDataProvider();
  const recommendations = await provider.getRecommendations();

  return NextResponse.json({
    source: process.env.DATA_SOURCE ?? "mock",
    collection: "recommendations",
    count: recommendations.length,
    data: recommendations,
  });
}
