"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelinePoint } from "@/types/market";

interface ProofOfAccuracyChartProps {
  timeline: TimelinePoint[];
}

type ChartRow = {
  label: string;
  timestamp: string;
  actual?: number;
  predicted?: number;
};

const marketOptions = [
  { key: "fcrDUp", label: "FCR-D Up" },
  { key: "fcrDDown", label: "FCR-D Down" },
  { key: "fcrN", label: "FCR-N" },
  { key: "mfrr", label: "mFRR" },
  { key: "spot", label: "Spot" },
] as const;

type MarketKey = (typeof marketOptions)[number]["key"];

export function ProofOfAccuracyChart({ timeline }: ProofOfAccuracyChartProps) {
  const [activeMarket, setActiveMarket] = useState<MarketKey>("fcrDUp");
  const nowIndex = timeline.findIndex((point) => point.kind === "forecast");
  const boundaryIndex = nowIndex > 0 ? nowIndex - 1 : timeline.length - 1;

  const rows: ChartRow[] = useMemo(
    () =>
      timeline.map((point) => {
        const value = point[activeMarket];
        const row: ChartRow = {
          label: point.label,
          timestamp: point.timestamp,
        };

        if (point.kind === "historical") row.actual = value;
        if (point.kind === "forecast") row.predicted = value;

        return row;
      }),
    [timeline, activeMarket],
  );

  const nowLabel = timeline[boundaryIndex]?.label;
  const activeLabel = marketOptions.find((item) => item.key === activeMarket)?.label ?? "Market";

  return (
    <Card className="h-[410px]">
      <CardHeader>
        <CardTitle>PREDICTION CHART</CardTitle>
        <CardDescription>Historical actual vs model prediction ({activeLabel})</CardDescription>
        <div className="mt-4 flex flex-wrap gap-2">
          {marketOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setActiveMarket(option.key)}
              className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition ${
                activeMarket === option.key
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_16px_rgba(124,255,100,0.25)]"
                  : "border-white/15 bg-slate-900/60 text-slate-300 hover:border-white/30"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <motion.div
          key={activeMarket}
          initial={{ opacity: 0.45, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ left: 4, right: 8, top: 10, bottom: 2 }}>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,166,195,0.18)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#8fa4c2", fontSize: 10 }}
                tickMargin={8}
                minTickGap={26}
                stroke="rgba(148,166,195,0.2)"
              />
              <YAxis tick={{ fill: "#8fa4c2", fontSize: 11 }} stroke="rgba(148,166,195,0.2)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(9, 18, 33, 0.95)",
                  border: "1px solid rgba(148, 166, 195, 0.2)",
                  borderRadius: 12,
                  color: "#d7e0ed",
                }}
              />

              {nowLabel ? (
                <ReferenceLine
                  x={nowLabel}
                  stroke="#f7a535"
                  strokeDasharray="6 5"
                  label={{ value: "NOW / BIDDING WINDOW", position: "insideTopRight", fill: "#f7a535" }}
                />
              ) : null}

              <Line type="monotone" dataKey="actual" name="Actual (Historical)" stroke="#3b82f6" strokeWidth={2.2} dot={false} />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Model Prediction"
                stroke="#ff8a00"
                strokeWidth={2.1}
                strokeDasharray="7 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
