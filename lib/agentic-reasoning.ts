import type {
  ForecastSeriesPoint,
  ProductionGapPoint,
  ReasoningInsight,
  SiteConfig,
  WeatherPoint,
} from "@/types/market";

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function generateAgenticInsight(
  forecast: ForecastSeriesPoint[],
  weather: WeatherPoint[],
  productionGap: ProductionGapPoint[],
  activeSite: SiteConfig,
): ReasoningInsight {
  const next24Weather = weather.slice(0, 24);
  const next24Gap = productionGap.slice(0, 24);
  const next24Forecast = forecast.slice(0, 24);

  const avgWind = average(next24Weather.map((w) => w.wind_ms));
  const avgTemp = average(next24Weather.map((w) => w.temperature_c));
  const avgGap = average(next24Gap.map((g) => g.gap_mw));
  const avgFcrDSignal = average(next24Forecast.map((point) => point.fcrDUp + point.fcrDDown));
  const avgMfrrSignal = average(next24Forecast.map((point) => point.mfrr));
  const deltaMagnitude = Math.abs(avgGap) + Math.abs(avgTemp * 75) + Math.abs((3.5 - avgWind) * 120);
  const confidenceScore = Math.max(40, Math.min(98, Math.round(58 + deltaMagnitude / 35)));

  const drivers: string[] = [];
  const reserveMw = Math.max(0.4, activeSite.capacity * 0.84);
  let summary = `${activeSite.name} (#${activeSite.id}) is currently at ${activeSite.soc}% SOC.`;
  let strategy = `Diversify across FCR-D and mFRR with a moderate Spot hedge. Reserve ${reserveMw.toFixed(
    1,
  )}MW for the 18:00 auction window.`;
  let confidence: ReasoningInsight["confidence"] = "Medium";

  if (avgWind < 3.5) {
    drivers.push("Low wind output in SE3 is likely to increase balancing disturbances.");
  } else {
    drivers.push("Wind profile remains supportive for short-term balancing stability.");
  }

  if (avgTemp < -2) {
    drivers.push("Cold front load pressure indicates elevated reserve demand.");
  } else {
    drivers.push("Temperature outlook is moderate with controlled demand pressure.");
  }

  if (avgGap < -450) {
    drivers.push("Negative production gap suggests import stress and reserve scarcity.");
  } else {
    drivers.push("Production-consumption gap remains within manageable boundaries.");
  }

  if (avgWind < 3.5 && avgTemp < -2 && avgGap < -450 && avgFcrDSignal > 34) {
    summary = `${activeSite.name} (#${activeSite.id}) is currently at ${activeSite.soc}% SOC. Low wind in SE3 + cold front detected, disturbance risk is high.`;
    strategy = `Based on the 48h FCR-D spike prediction, we recommend reserving ${reserveMw.toFixed(
      1,
    )}MW for the 18:00 auction with secondary mFRR coverage.`;
    confidence = "High";
  } else if (avgMfrrSignal > avgFcrDSignal) {
    summary = `${activeSite.name} (#${activeSite.id}) at ${activeSite.soc}% SOC shows activation dynamics favoring mFRR over static reserve products.`;
    strategy = `Tilt allocation toward mFRR and keep ${Math.max(
      0.35,
      activeSite.capacity * 0.65,
    ).toFixed(1)}MW in FCR-D contingency.`;
    confidence = "Medium";
  }

  return {
    summary,
    strategy,
    confidence,
    confidenceScore,
    drivers,
  };
}
