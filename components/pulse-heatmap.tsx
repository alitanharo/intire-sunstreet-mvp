"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSek } from "@/lib/utils";
import type { MarketTurnoverPoint } from "@/types/market";

interface PulseHeatmapProps {
  turnovers: MarketTurnoverPoint[];
}

type HeatmapBox = {
  name: string;
  value: number;
  percentage: number;
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

function toBoxes(turnovers: MarketTurnoverPoint[]): HeatmapBox[] {
  const source: MarketTurnoverPoint[] = turnovers.length
    ? turnovers
    : [
        { market: "FCR-D", turnoverSek: 3968, trend: "high" },
        { market: "mFRR", turnoverSek: 1456, trend: "mid" },
        { market: "FCR-N", turnoverSek: 860, trend: "mid" },
        { market: "Spot", turnoverSek: 569, trend: "low" },
      ];

  const sorted = [...source].sort((a, b) => b.turnoverSek - a.turnoverSek);
  const total = sorted.reduce((sum, item) => sum + item.turnoverSek, 0) || 1;

  return sorted.map((item, index) => {
    const style = marketStyleMap[item.market];

    if (index === 0) {
      return {
        name: item.market,
        value: item.turnoverSek,
        percentage: (item.turnoverSek / total) * 100,
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
      color: style.color,
      bg: style.bg,
      colSpan: "col-span-5",
      rowSpan: "row-span-3",
    };
  });
}

export function PulseHeatmap({ turnovers }: PulseHeatmapProps) {
  const boxes = toBoxes(turnovers);

  return (
    <Card className="h-[430px]">
      <CardHeader>
        <CardTitle>THE PULSE HEATMAP</CardTitle>
        <CardDescription>Operational market intensity by true turnover (SEK)</CardDescription>
      </CardHeader>

      <CardContent className="h-[340px] p-0">
        <div className="grid h-full w-full grid-cols-12 grid-rows-6 gap-0 overflow-hidden rounded-sm border border-slate-900">
          {boxes.map((box) => (
            <div
              key={box.name}
              className={`${box.colSpan} ${box.rowSpan} flex min-h-0 min-w-0 flex-col items-center justify-center border border-slate-900 px-2 text-center`}
              style={{ background: box.bg }}
            >
              <div className="truncate text-lg font-extrabold tracking-wide" style={{ color: box.color }}>
                {box.name}
              </div>
              <div className="mt-1 truncate text-sm font-semibold text-slate-100 sm:text-base">
                {formatSek(box.value, 0)}
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
