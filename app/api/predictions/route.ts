import { NextResponse } from "next/server";

import { getMarketDataProvider } from "@/lib/data-provider";

export async function GET() {
  const provider = getMarketDataProvider();
  const predictions = await provider.getPredictions();

  return NextResponse.json({
    source: process.env.DATA_SOURCE ?? "mock",
    collection: "predictions",
    count: predictions.length,
    data: predictions,
  });
}
