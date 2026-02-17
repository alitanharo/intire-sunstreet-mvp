import type {
  AncillaryMarket,
  ForecastSeriesPoint,
  HourlyWinningPoint,
  MarketDominancePoint,
  MarketTurnoverPoint,
  SiteConfig,
  StrategyComparison,
} from "@/types/market";

export const EURO_TO_SEK = 11;
export const FCR_D_CAPACITY_FACTOR = 0.83;
export const FCR_N_CAPACITY_FACTOR = 0.45;
export const MFRR_ACTIVATION_BONUS = 1.2;

export function calculateFcrDTurnover(priceUp: number, priceDown: number): number {
  return (priceUp + priceDown) * FCR_D_CAPACITY_FACTOR * EURO_TO_SEK;
}

export function calculateFcrNTurnover(price: number): number {
  return price * FCR_N_CAPACITY_FACTOR * EURO_TO_SEK;
}

export function calculateMfrrTurnover(price: number): number {
  return price * FCR_D_CAPACITY_FACTOR * EURO_TO_SEK * MFRR_ACTIVATION_BONUS;
}

export function calculateSpotSpreadProfit(dailyMinPrice: number, dailyMaxPrice: number): number {
  return dailyMaxPrice - dailyMinPrice;
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculate24hFcrProfit(forecast: ForecastSeriesPoint[]): number {
  const first24 = forecast.slice(0, 24);

  const avgFcrN = avg(first24.map((point) => calculateFcrNTurnover(point.fcrN)));
  const avgFcrD = avg(
    first24.map((point) => calculateFcrDTurnover(point.fcrDUp, point.fcrDDown)),
  );

  return Math.max(avgFcrN, avgFcrD);
}

export function deriveTurnoversFromForecast(
  forecast: ForecastSeriesPoint[],
  activeSite: SiteConfig,
): MarketTurnoverPoint[] {
  const hours = forecast.slice(0, 48);
  const fcrNTurnover = hours.reduce(
    (sum, point) => sum + calculateFcrNTurnover(point.fcrN) * activeSite.capacity,
    0,
  );
  const fcrDTurnover = hours.reduce(
    (sum, point) => sum + calculateFcrDTurnover(point.fcrDUp, point.fcrDDown) * activeSite.capacity,
    0,
  );
  const mfrrTurnover = hours.reduce(
    (sum, point) => sum + calculateMfrrTurnover(point.mfrr) * activeSite.capacity,
    0,
  );
  const spotTurnover = hours.reduce((sum, point, index, arr) => {
    if (index === 0) return sum;
    const spread = Math.max(0, point.spot - arr[index - 1].spot);
    return sum + spread * EURO_TO_SEK * activeSite.capacity;
  }, 0);

  const maxValue = Math.max(fcrNTurnover, fcrDTurnover, mfrrTurnover, spotTurnover);

  const classifyTrend = (value: number): "high" | "mid" | "low" => {
    const ratio = value / maxValue;
    if (ratio >= 0.8) return "high";
    if (ratio >= 0.55) return "mid";
    return "low";
  };

  return [
    { market: "FCR-N", turnoverSek: fcrNTurnover, trend: classifyTrend(fcrNTurnover) },
    { market: "FCR-D", turnoverSek: fcrDTurnover, trend: classifyTrend(fcrDTurnover) },
    { market: "mFRR", turnoverSek: mfrrTurnover, trend: classifyTrend(mfrrTurnover) },
    { market: "Spot", turnoverSek: spotTurnover, trend: classifyTrend(spotTurnover) },
  ];
}

function toHourlyTurnoverMap(point: ForecastSeriesPoint, capacity: number): Record<AncillaryMarket, number> {
  return {
    "FCR-N": calculateFcrNTurnover(point.fcrN) * capacity,
    "FCR-D": calculateFcrDTurnover(point.fcrDUp, point.fcrDDown) * capacity,
    mFRR: calculateMfrrTurnover(point.mfrr) * capacity,
    Spot: point.spot * EURO_TO_SEK * capacity,
  };
}

export function calculateHourlyWinningPath(
  forecast: ForecastSeriesPoint[],
  activeSite: SiteConfig,
): HourlyWinningPoint[] {
  return forecast.slice(0, 48).map((point) => {
    const map = toHourlyTurnoverMap(point, activeSite.capacity);
    const winner = (Object.entries(map) as Array<[AncillaryMarket, number]>).reduce((best, current) =>
      current[1] > best[1] ? current : best,
    );

    return {
      timestamp: point.timestamp,
      hourLabel: point.hourLabel,
      market: winner[0],
      turnoverSek: winner[1],
    };
  });
}

export function calculateMarketDominance(
  forecast: ForecastSeriesPoint[],
  activeSite: SiteConfig,
): MarketDominancePoint[] {
  const winners = calculateHourlyWinningPath(forecast, activeSite);
  const marketTotals = deriveTurnoversFromForecast(forecast, activeSite).reduce<Record<AncillaryMarket, number>>(
    (acc, item) => {
      acc[item.market] = item.turnoverSek;
      return acc;
    },
    { "FCR-N": 0, "FCR-D": 0, mFRR: 0, Spot: 0 },
  );

  const firstHour = forecast[0];
  const firstHourValues = firstHour
    ? toHourlyTurnoverMap(firstHour, activeSite.capacity)
    : { "FCR-N": 0, "FCR-D": 0, mFRR: 0, Spot: 0 };

  const winnerCounts = winners.reduce<Record<AncillaryMarket, number>>(
    (acc, point) => {
      acc[point.market] += 1;
      return acc;
    },
    { "FCR-N": 0, "FCR-D": 0, mFRR: 0, Spot: 0 },
  );

  const maxTurnover = Math.max(...Object.values(marketTotals), 1);
  const classifyTrend = (value: number): "high" | "mid" | "low" => {
    const ratio = value / maxTurnover;
    if (ratio >= 0.8) return "high";
    if (ratio >= 0.55) return "mid";
    return "low";
  };

  return (["FCR-D", "mFRR", "FCR-N", "Spot"] as AncillaryMarket[]).map((market) => ({
    market,
    winnerHours: winnerCounts[market],
    winnerSharePct: winners.length ? (winnerCounts[market] / winners.length) * 100 : 0,
    turnoverSek: marketTotals[market],
    currentOptimizedSek: firstHourValues[market],
    trend: classifyTrend(marketTotals[market]),
  }));
}

export function calculateOptimizedPotential48h(
  forecast: ForecastSeriesPoint[],
  activeSite: SiteConfig,
) {
  return calculateHourlyWinningPath(forecast, activeSite).reduce((sum, item) => sum + item.turnoverSek, 0);
}

export function getTopMarketRecommendation(
  forecast: ForecastSeriesPoint[],
  activeSite: SiteConfig,
): string {
  const turnovers = deriveTurnoversFromForecast(forecast, activeSite);
  const best = turnovers.reduce((currentBest, item) =>
    item.turnoverSek > currentBest.turnoverSek ? item : currentBest,
  );

  const first24 = forecast.slice(0, 24);
  const spotSpread = calculateSpotSpreadProfit(
    Math.min(...first24.map((point) => point.spot)),
    Math.max(...first24.map((point) => point.spot)),
  );
  const spotSpreadSek = spotSpread * EURO_TO_SEK;
  const fcr24hProfit = calculate24hFcrProfit(forecast);

  if (spotSpreadSek > fcr24hProfit) {
    return "SPOT MARKET";
  }

  return best.market;
}

export function simulateStrategyPerformance(
  forecast: ForecastSeriesPoint[],
  activeSite: SiteConfig,
): StrategyComparison {
  const hours = forecast.slice(0, 48);
  const aiRevenue = calculateOptimizedPotential48h(hours, activeSite);

  const staticFcrnRevenue = hours.reduce(
    (sum, point) => sum + calculateFcrNTurnover(point.fcrN) * activeSite.capacity,
    0,
  );

  const revenueAlphaPct =
    staticFcrnRevenue > 0
      ? ((aiRevenue - staticFcrnRevenue) / staticFcrnRevenue) * 100
      : 0;

  return {
    totalAiStrategyRevenue: aiRevenue,
    staticFcrnRevenue,
    revenueAlphaPct,
  };
}
