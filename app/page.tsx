import { Activity, Clock3, Target, Zap } from "lucide-react";

import { PulseHeatmap } from "@/components/pulse-heatmap";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/dashboard-service";
import { formatSek } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot(params?.site);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 md:px-10 md:py-10">
      <header className="mb-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl lg:text-[2.6rem]">
            Intire Sunstreet Energy Bidding Optimizer
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300/95 md:text-base">
            AI-guided balancing and spot market allocation with true turnover calculations in SEK/MW.
            Built for high-performance decisioning in Swedish ancillary markets.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
          <Card className="min-w-[180px]">
            <CardContent className="flex items-center gap-3 py-4">
              <Clock3 className="h-4 w-4 text-[#7bb3ff]" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Generated</div>
                <div className="text-sm text-slate-200">
                  {new Date(snapshot.generatedAt).toLocaleTimeString("sv-SE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[180px]">
            <CardContent className="flex items-center gap-3 py-4">
              <Activity className="h-4 w-4 text-[var(--warning)]" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Horizon</div>
                <div className="text-sm text-slate-200">Next 48 Hours</div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[180px]">
            <CardContent className="flex items-center gap-3 py-4">
              <Zap className="h-4 w-4 text-[var(--accent)]" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Mode</div>
                <div className="text-sm text-slate-200">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)] live-dot" />
                  Agentic Live
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="neon-top-market neon-glow-card xl:col-span-1">
          <CardContent className="py-7">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
              <Target className="h-4 w-4 text-[var(--accent)]" />
              Top Market Recommendation
            </div>
            <div className="text-3xl font-semibold text-[var(--accent)]">{snapshot.topRecommendation}</div>
            <p className="mt-3 text-sm text-slate-400">
              Predicted 48h Optimized Potential:{" "}
              <span className="font-semibold text-slate-200">{formatSek(snapshot.turnover48hSek, 0)}</span>
            </p>
          </CardContent>
        </Card>
      </section>

      {snapshot.dataGapWarning ? (
        <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {snapshot.dataGapWarning}
        </div>
      ) : null}

      <section className="mt-5">
        <PulseHeatmap turnovers={snapshot.turnovers} dominance={snapshot.dominance} />
      </section>
    </main>
  );
}
