import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatSek } from "@/lib/utils";
import type { StrategyComparison } from "@/types/market";

interface AlphaStrategyCardProps {
  strategyComparison: StrategyComparison;
}

export function AlphaStrategyCard({ strategyComparison }: AlphaStrategyCardProps) {
  const maxValue = Math.max(
    strategyComparison.totalAiStrategyRevenue,
    strategyComparison.staticFcrnRevenue,
    1,
  );

  const aiWidth = (strategyComparison.totalAiStrategyRevenue / maxValue) * 100;
  const baselineWidth = (strategyComparison.staticFcrnRevenue / maxValue) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[var(--warning)]" />
          ALPHA STRATEGY COMPARISON
        </CardTitle>
        <CardDescription>AI optimized strategy vs static FCR-N standard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>AI Optimized Strategy</span>
            <span className="font-semibold text-[var(--accent)]">
              {formatSek(strategyComparison.totalAiStrategyRevenue, 0)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-800/70">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${aiWidth}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>FCR-N Standard</span>
            <span className="font-semibold text-[#9bb2cf]">
              {formatSek(strategyComparison.staticFcrnRevenue, 0)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-800/70">
            <div className="h-full rounded-full bg-[#7bb3ff]" style={{ width: `${baselineWidth}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-center">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Revenue Alpha</div>
          <div className="mt-1 text-3xl font-semibold text-[var(--accent)]">
            +{formatNumber(strategyComparison.revenueAlphaPct, 1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
