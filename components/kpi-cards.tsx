import { ArrowUpRight, Target, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatSek } from "@/lib/utils";

interface KpiCardsProps {
  topMarketRecommendation: string;
  turnover48hSek: number;
  revenueAlphaPct: number;
  budgetProgressPct: number;
}

export function KpiCards({
  topMarketRecommendation,
  turnover48hSek,
  revenueAlphaPct,
  budgetProgressPct,
}: KpiCardsProps) {
  const isFcrDPriority = topMarketRecommendation === "FCR-D";

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className={`${isFcrDPriority ? "neon-top-market" : ""} neon-glow-card`}>
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-slate-300">
            <Target className="h-4 w-4 text-[var(--accent)]" />
            Top Market Recommendation
          </CardDescription>
          <CardTitle className="mt-2 text-2xl text-[var(--accent)]">{topMarketRecommendation}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="neon-glow-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="h-4 w-4 text-[#7bb3ff]" />
            Predicted 48h Turnover
          </CardDescription>
          <CardTitle className="mt-2 text-2xl">{formatSek(turnover48hSek, 0)}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-slate-400">Actual predicted revenue for active site</CardContent>
      </Card>

      <Card className="neon-glow-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-slate-300">
            <ArrowUpRight className="h-4 w-4 text-[var(--warning)]" />
            Revenue Alpha vs. Baseline
          </CardDescription>
          <CardTitle className="mt-2 text-2xl text-[var(--accent)]">
            +{formatNumber(revenueAlphaPct, 1)}%
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-slate-400">Expected uplift compared to static dispatch mix</CardContent>
      </Card>

      <Card className="neon-glow-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-slate-300">
            <ArrowUpRight className="h-4 w-4 text-[#ffd54f]" />
            Month Progress vs. Budget
          </CardDescription>
          <CardTitle className="mt-2 text-2xl text-[#ffd54f]">
            {formatNumber(budgetProgressPct, 1)}%
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-slate-400">Erik baseline budget trajectory (current month)</CardContent>
      </Card>
    </section>
  );
}
