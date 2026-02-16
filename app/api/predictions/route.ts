import { NextResponse } from "next/server";

import { getMarketDataProvider, resolveDataSourceMode } from "@/lib/data-provider";

export async function GET() {
  const source = resolveDataSourceMode();
  const provider = getMarketDataProvider(source);
  const predictions = await provider.getPredictions();

  return NextResponse.json({
    source,
    collection: "predictions",
    count: predictions.length,
    data: predictions,
  });
}
