"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForecastSeriesPoint } from "@/types/market";

interface ForecastChartProps {
  forecast: ForecastSeriesPoint[];
}

export function ForecastChart({ forecast }: ForecastChartProps) {
  return (
    <Card className="h-[420px]">
      <CardHeader>
        <CardTitle>THE 48H FORECAST CHART</CardTitle>
        <CardDescription>Predicted hourly prices across FCR-N, FCR-D, mFRR and Spot</CardDescription>
      </CardHeader>
      <CardContent className="h-[330px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecast} margin={{ left: 4, right: 8, top: 12, bottom: 4 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,166,195,0.18)" />
            <XAxis
              dataKey="hourLabel"
              tick={{ fill: "#8fa4c2", fontSize: 11 }}
              tickMargin={8}
              minTickGap={24}
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
            <Line type="monotone" dataKey="fcrN" name="FCR-N" stroke="#7cc6ff" strokeWidth={2} dot={false} />
            <Line
              type="monotone"
              dataKey="fcrDUp"
              name="FCR-D Up"
              stroke="#7cff64"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="fcrDDown"
              name="FCR-D Down"
              stroke="#9ef48e"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line type="monotone" dataKey="mfrr" name="mFRR" stroke="#f7a535" strokeWidth={2} dot={false} />
            <Line
              type="monotone"
              dataKey="spot"
              name="Spot"
              stroke="#d26c88"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
