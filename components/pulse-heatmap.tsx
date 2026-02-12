"use client";

import { ResponsiveTreeMapHtml } from "@nivo/treemap";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketTurnoverPoint } from "@/types/market";

interface PulseHeatmapProps {
  turnovers: MarketTurnoverPoint[];
}

interface HeatmapLeafData {
  name: string;
  loc: number;
  trend: MarketTurnoverPoint["trend"];
  turnover: number;
}

const trendColorMap: Record<MarketTurnoverPoint["trend"], string> = {
  high: "#7CFF64",
  mid: "#f7a535",
  low: "#b95772",
};

export function PulseHeatmap({ turnovers }: PulseHeatmapProps) {
  const data = {
    name: "markets",
    children: turnovers.map<HeatmapLeafData>((item) => ({
      name: item.market,
      loc: Math.max(item.turnoverSekMw, 1),
      trend: item.trend,
      turnover: item.turnoverSekMw,
    })),
  };

  return (
    <Card className="h-[420px]">
      <CardHeader>
        <CardTitle>THE PULSE HEATMAP</CardTitle>
        <CardDescription>Intire-Sunstreet market intensity by true SEK/MW turnover</CardDescription>
      </CardHeader>
      <CardContent className="h-[330px]">
        <ResponsiveTreeMapHtml
          data={data}
          identity="name"
          value="loc"
          innerPadding={8}
          outerPadding={4}
          tile="squarify"
          colors={(node) => {
            const trend = (node.data as { trend?: MarketTurnoverPoint["trend"] }).trend ?? "mid";
            return trendColorMap[trend];
          }}
          label={(node) => `${node.id}\n${node.formattedValue} SEK/MW`}
          labelSkipSize={24}
          labelTextColor="#031009"
          borderWidth={1}
          borderColor="#0a1222"
          tooltip={(node) => {
            const payload = node.node.data as {
              name: string;
              turnover: number;
              trend: MarketTurnoverPoint["trend"];
            };

            return (
              <div className="rounded-lg border border-white/15 bg-[#0b1629]/95 px-3 py-2 text-xs text-slate-200 shadow-xl">
                <div className="font-semibold text-white">{payload.name}</div>
                <div>{Math.round(payload.turnover).toLocaleString("sv-SE")} SEK/MW</div>
                <div className="capitalize text-slate-300">Trend: {payload.trend}</div>
              </div>
            );
          }}
          enableParentLabel={false}
          leavesOnly
          animate
          motionConfig="gentle"
        />
      </CardContent>
    </Card>
  );
}
