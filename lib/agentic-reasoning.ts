import type { ForecastSeriesPoint, ProductionGapPoint, ReasoningInsight, WeatherPoint } from "@/types/market";

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function generateAgenticInsight(
  forecast: ForecastSeriesPoint[],
  weather: WeatherPoint[],
  productionGap: ProductionGapPoint[],
): ReasoningInsight {
  const next24Weather = weather.slice(0, 24);
  const next24Gap = productionGap.slice(0, 24);
  const next24Forecast = forecast.slice(0, 24);

  const avgWind = average(next24Weather.map((w) => w.wind_ms));
  const avgTemp = average(next24Weather.map((w) => w.temperature_c));
  const avgGap = average(next24Gap.map((g) => g.gap_mw));
  const avgFcrDSignal = average(next24Forecast.map((point) => point.fcrDUp + point.fcrDDown));
  const avgMfrrSignal = average(next24Forecast.map((point) => point.mfrr));

  const drivers: string[] = [];
  let summary = "Balanced conditions in SE3.";
  let strategy = "Diversify across FCR-D and mFRR with a moderate Spot hedge.";
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
    summary = "REASONING: Low wind in SE3 + cold front detected. Disturbance risk is high.";
    strategy = "Strategy: Prioritize FCR-D with a secondary mFRR layer and limited Spot exposure.";
    confidence = "High";
  } else if (avgMfrrSignal > avgFcrDSignal) {
    summary = "REASONING: Activation dynamics favor mFRR over static reserve products.";
    strategy = "Strategy: Tilt allocation toward mFRR and keep FCR-D as contingency capacity.";
    confidence = "Medium";
  }

  return {
    summary,
    strategy,
    confidence,
    drivers,
  };
}
