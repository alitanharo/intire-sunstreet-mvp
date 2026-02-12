import { ArrowUpRight, Target, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatSek } from "@/lib/utils";

interface KpiCardsProps {
  topMarketRecommendation: string;
  turnover48hSekMw: number;
  revenueAlphaVsBaseline: number;
}

export function KpiCards({
  topMarketRecommendation,
  turnover48hSekMw,
  revenueAlphaVsBaseline,
}: KpiCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-slate-300">
            <Target className="h-4 w-4 text-[var(--accent)]" />
            Top Market Recommendation
          </CardDescription>
          <CardTitle className="mt-2 text-2xl text-[var(--accent)]">{topMarketRecommendation}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="h-4 w-4 text-[#7bb3ff]" />
            Predicted 48h Turnover
          </CardDescription>
          <CardTitle className="mt-2 text-2xl">{formatSek(turnover48hSekMw, 0)}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-slate-400">SEK / MW normalized potential</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-slate-300">
            <ArrowUpRight className="h-4 w-4 text-[var(--warning)]" />
            Revenue Alpha vs. Baseline
          </CardDescription>
          <CardTitle className="mt-2 text-2xl text-[var(--accent)]">
            +{formatNumber(revenueAlphaVsBaseline, 1)}%
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-slate-400">Expected uplift compared to static dispatch mix</CardContent>
      </Card>
    </section>
  );
}
