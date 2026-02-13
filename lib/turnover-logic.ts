import type {
  ForecastSeriesPoint,
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
  const avgFcrNPrice = avg(forecast.map((point) => point.fcrN));
  const avgFcrDUp = avg(forecast.map((point) => point.fcrDUp));
  const avgFcrDDown = avg(forecast.map((point) => point.fcrDDown));
  const avgMfrrPrice = avg(forecast.map((point) => point.mfrr));

  const spotPrices = forecast.map((point) => point.spot);
  const dailyMin = Math.min(...spotPrices);
  const dailyMax = Math.max(...spotPrices);

  const fcrNTurnover = calculateFcrNTurnover(avgFcrNPrice) * activeSite.capacity;
  const fcrDTurnover = calculateFcrDTurnover(avgFcrDUp, avgFcrDDown) * activeSite.capacity;
  const mfrrTurnover = calculateMfrrTurnover(avgMfrrPrice) * activeSite.capacity;
  const spotTurnover = calculateSpotSpreadProfit(dailyMin, dailyMax) * EURO_TO_SEK * activeSite.capacity;

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
  const aiRevenue = deriveTurnoversFromForecast(forecast, activeSite).reduce(
    (sum, item) => sum + item.turnoverSek,
    0,
  );

  const avgFcrN = avg(forecast.map((point) => point.fcrN));
  const staticFcrnRevenue =
    calculateFcrNTurnover(avgFcrN) * activeSite.capacity * FCR_N_CAPACITY_FACTOR;

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
