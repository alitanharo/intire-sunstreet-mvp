"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimelinePoint } from "@/types/market";

interface HybridTimelineChartProps {
  timeline: TimelinePoint[];
}

const lineConfig = [
  { key: "fcrDUp", label: "FCR-D Up", color: "#76ff03" },
  { key: "fcrDDown", label: "FCR-D Down", color: "#b2ff59" },
  { key: "fcrN", label: "FCR-N", color: "#00d4ff" },
  { key: "mfrr", label: "mFRR", color: "#ff2ad4" },
  { key: "spot", label: "Spot", color: "#ff8a00" },
  { key: "budget", label: "Budget/h", color: "#ffd54f" },
] as const;

type LineKey = (typeof lineConfig)[number]["key"];

export function HybridTimelineChart({ timeline }: HybridTimelineChartProps) {
  const [enabled, setEnabled] = useState<Record<LineKey, boolean>>({
    fcrDUp: true,
    fcrDDown: true,
    fcrN: true,
    mfrr: true,
    spot: true,
    budget: true,
  });

  const nowMarker = useMemo(
    () => timeline.find((point) => point.isNowMarker)?.label ?? timeline[0]?.label,
    [timeline],
  );

  return (
    <motion.div
      key={timeline.at(-1)?.timestamp}
      initial={{ opacity: 0.35, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="h-[510px] neon-glow-card">
      <CardHeader>
        <CardTitle>THE HYBRID TIMELINE</CardTitle>
        <CardDescription>Past 7 Days (Historical) + Next 48 Hours (Forecast)</CardDescription>
        <div className="mt-4 flex flex-wrap gap-2">
          {lineConfig.map((line) => (
            <button
              key={line.key}
              type="button"
              onClick={() => setEnabled((prev) => ({ ...prev, [line.key]: !prev[line.key] }))}
              className={cn(
                "transition-all",
                enabled[line.key] ? "opacity-100" : "opacity-45 grayscale",
              )}
            >
              <Badge variant="default" className="border-white/20 bg-slate-900/70 text-slate-200">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: line.color }} />
                {line.label}
              </Badge>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[385px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline} margin={{ left: 4, right: 8, top: 12, bottom: 4 }}>
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
              labelStyle={{ color: "#dce5f2" }}
            />
            <Legend wrapperStyle={{ color: "#b2c1d8", fontSize: 12 }} />
            {nowMarker ? (
              <ReferenceLine
                x={nowMarker}
                stroke="#f7a535"
                strokeDasharray="5 5"
                label={{ value: "NOW", position: "insideTopRight", fill: "#f7a535" }}
              />
            ) : null}

            {enabled.fcrN ? (
              <Line type="monotone" dataKey="fcrN" name="FCR-N" stroke="#00d4ff" strokeWidth={2.2} dot={false} />
            ) : null}
            {enabled.fcrDUp ? (
              <Line
                type="monotone"
                dataKey="fcrDUp"
                name="FCR-D Up"
                stroke="#76ff03"
                strokeWidth={2.2}
                dot={false}
              />
            ) : null}
            {enabled.fcrDDown ? (
              <Line
                type="monotone"
                dataKey="fcrDDown"
                name="FCR-D Down"
                stroke="#b2ff59"
                strokeWidth={2.1}
                strokeDasharray="4 4"
                dot={false}
              />
            ) : null}
            {enabled.mfrr ? (
              <Line type="monotone" dataKey="mfrr" name="mFRR" stroke="#ff2ad4" strokeWidth={2.2} dot={false} />
            ) : null}
            {enabled.spot ? (
              <Line type="monotone" dataKey="spot" name="Spot" stroke="#ff8a00" strokeWidth={2.2} dot={false} />
            ) : null}
            {enabled.budget ? (
              <Line
                type="monotone"
                dataKey="budget"
                name="Budget per Hour"
                stroke="#ffd54f"
                strokeWidth={2}
                strokeDasharray="7 4"
                dot={false}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      </Card>
    </motion.div>
  );
}
