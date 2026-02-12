"use client";

import { ForecastChart } from "@/components/forecast-chart";
import { PulseHeatmap } from "@/components/pulse-heatmap";
import type { ForecastSeriesPoint, MarketTurnoverPoint } from "@/types/market";

interface DashboardVisualsProps {
  forecast: ForecastSeriesPoint[];
  turnovers: MarketTurnoverPoint[];
}

export function DashboardVisuals({ forecast, turnovers }: DashboardVisualsProps) {
  return (
    <section className="mt-6 grid gap-4 xl:grid-cols-5">
      <div className="xl:col-span-2">
        <PulseHeatmap turnovers={turnovers} />
      </div>
      <div className="xl:col-span-3">
        <ForecastChart forecast={forecast} />
      </div>
    </section>
  );
}
