"use client";

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
  knownAtBid?: number;
};

export function ProofOfAccuracyChart({ timeline }: ProofOfAccuracyChartProps) {
  const nowIndex = timeline.findIndex((point) => point.kind === "forecast");
  const boundaryIndex = nowIndex > 0 ? nowIndex - 1 : timeline.length - 1;
  const knownAtBidValue = timeline[boundaryIndex]?.fcrDUp;

  const rows: ChartRow[] = timeline.map((point, index) => {
    const row: ChartRow = {
      label: point.label,
      timestamp: point.timestamp,
    };

    if (point.kind === "historical") {
      row.actual = point.fcrDUp;

      if (index >= Math.max(0, boundaryIndex - 12) && index <= boundaryIndex) {
        row.knownAtBid = point.fcrDUp;
      }
    }

    if (point.kind === "forecast") {
      row.predicted = point.fcrDUp;
      row.knownAtBid = knownAtBidValue;
    }

    return row;
  });

  const nowLabel = timeline[boundaryIndex]?.label;

  return (
    <Card className="h-[410px]">
      <CardHeader>
        <CardTitle>PROOF OF ACCURACY</CardTitle>
        <CardDescription>
          Historical actual vs model prediction vs known-at-prediction-time baseline (FCR-D Up)
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
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
            <Line
              type="monotone"
              dataKey="knownAtBid"
              name="Known at Prediction Time"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="2 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
