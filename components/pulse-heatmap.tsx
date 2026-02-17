"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSek } from "@/lib/utils";
import type { MarketDominancePoint, MarketTurnoverPoint } from "@/types/market";

interface PulseHeatmapProps {
  turnovers: MarketTurnoverPoint[];
  dominance?: MarketDominancePoint[];
}

type HeatmapBox = {
  name: string;
  value: number;
  percentage: number;
  winnerHours: number;
  winnerSharePct: number;
  currentOptimizedSek: number;
  trend: "high" | "mid" | "low";
  color: string;
  bg: string;
  colSpan: string;
  rowSpan: string;
};

const marketStyleMap: Record<MarketTurnoverPoint["market"], { color: string; bg: string }> = {
  "FCR-N": { color: "#3b82f6", bg: "rgba(59,130,246,0.22)" },
  "FCR-D": { color: "#22c55e", bg: "rgba(34,197,94,0.22)" },
  mFRR: { color: "#a855f7", bg: "rgba(168,85,247,0.22)" },
  Spot: { color: "#eab308", bg: "rgba(234,179,8,0.22)" },
};

function toBoxes(turnovers: MarketTurnoverPoint[], dominance?: MarketDominancePoint[]): HeatmapBox[] {
  const source: MarketDominancePoint[] =
    dominance && dominance.length
      ? dominance
      : turnovers.map((item) => ({
          market: item.market,
          winnerHours: 0,
          winnerSharePct: 0,
          turnoverSek: item.turnoverSek,
          currentOptimizedSek: item.turnoverSek / 48,
          trend: item.trend,
        }));

  const sorted = [...source].sort((a, b) => b.turnoverSek - a.turnoverSek);
  const total = sorted.reduce((sum, item) => sum + item.turnoverSek, 0) || 1;

  return sorted.map((item, index) => {
    const style = marketStyleMap[item.market];

    if (index === 0) {
      return {
        name: item.market,
        value: item.turnoverSek,
        percentage: (item.turnoverSek / total) * 100,
        winnerHours: item.winnerHours,
        winnerSharePct: item.winnerSharePct,
        currentOptimizedSek: item.currentOptimizedSek,
        trend: item.trend,
        color: style.color,
        bg: style.bg,
        colSpan: "col-span-7",
        rowSpan: "row-span-6",
      };
    }

    if (index === 1) {
      return {
        name: item.market,
        value: item.turnoverSek,
        percentage: (item.turnoverSek / total) * 100,
        winnerHours: item.winnerHours,
        winnerSharePct: item.winnerSharePct,
        currentOptimizedSek: item.currentOptimizedSek,
        trend: item.trend,
        color: style.color,
        bg: style.bg,
        colSpan: "col-span-5",
        rowSpan: "row-span-3",
      };
    }

    return {
      name: item.market,
      value: item.turnoverSek,
      percentage: (item.turnoverSek / total) * 100,
      winnerHours: item.winnerHours,
      winnerSharePct: item.winnerSharePct,
      currentOptimizedSek: item.currentOptimizedSek,
      trend: item.trend,
      color: style.color,
      bg: style.bg,
      colSpan: "col-span-5",
      rowSpan: "row-span-3",
    };
  });
}

export function PulseHeatmap({ turnovers, dominance }: PulseHeatmapProps) {
  const boxes = toBoxes(turnovers, dominance);

  return (
    <Card className="h-[430px]">
      <CardHeader>
        <CardTitle>THE PULSE HEATMAP</CardTitle>
        <CardDescription>Market dominance across 48h optimized turnover potential (SEK)</CardDescription>
      </CardHeader>

      <CardContent className="h-[340px] p-0">
        <div className="grid h-full w-full grid-cols-12 grid-rows-6 gap-0 overflow-hidden rounded-sm border border-slate-900">
          {boxes.map((box) => (
            <div
              key={box.name}
              className={`${box.colSpan} ${box.rowSpan} flex min-h-0 min-w-0 flex-col items-center justify-center border px-2 text-center ${
                box.trend === "high"
                  ? "border-emerald-300/80 shadow-[inset_0_0_0_1px_rgba(74,222,128,0.35)]"
                  : box.trend === "mid"
                    ? "border-amber-300/60"
                    : "border-rose-300/45"
              }`}
              style={{ background: box.bg }}
            >
              <div className="truncate text-lg font-extrabold tracking-wide" style={{ color: box.color }}>
                {box.name}
              </div>
              <div className="mt-1 truncate text-sm font-semibold text-slate-100 sm:text-base">
                {formatSek(box.value, 0)}
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-200">
                Winner for {box.winnerHours}/48 hours ({box.winnerSharePct.toFixed(1)}%)
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-300">
                Current Price: {formatSek(box.currentOptimizedSek, 0)}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-300">
                {box.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
