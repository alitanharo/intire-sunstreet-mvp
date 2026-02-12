import { Activity, Clock3, Zap } from "lucide-react";

import { AgenticPilot } from "@/components/agentic-pilot";
import { DashboardVisuals } from "@/components/dashboard-visuals";
import { KpiCards } from "@/components/kpi-cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/dashboard-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 md:px-10 md:py-10">
      <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Badge className="mb-3" variant="default">
            SE3 • STOCKHOLM • 48H STRATEGY ENGINE
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">
            Intire Sunstreet Energy Bidding Optimizer
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
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
                <div className="text-sm text-slate-200">Agentic Live</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <KpiCards
        topMarketRecommendation={snapshot.topRecommendation}
        turnover48hSekMw={snapshot.turnover48hSekMw}
        revenueAlphaVsBaseline={snapshot.revenueAlphaVsBaseline}
      />

      <DashboardVisuals forecast={snapshot.forecast} turnovers={snapshot.turnovers} />

      <section className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AgenticPilot insight={snapshot.reasoning} />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Bid Split Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              {snapshot.recommendations.map((item) => (
                <div key={item.timestamp} className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="mb-3 text-xs uppercase tracking-[0.12em] text-slate-400">
                    Bid time: {new Date(item.bid_time_48h).toLocaleString("sv-SE")}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>FCR Split</div>
                    <div className="text-right text-[var(--accent)]">{Math.round(item.fcr_split * 100)}%</div>
                    <div>mFRR Split</div>
                    <div className="text-right text-[var(--accent)]">{Math.round(item.mfrr_split * 100)}%</div>
                    <div>mFRR CM Split</div>
                    <div className="text-right text-[var(--accent)]">
                      {Math.round(item.mfrr_cm_split * 100)}%
                    </div>
                    <div>Spot Split</div>
                    <div className="text-right text-[var(--accent)]">{Math.round(item.spot_split * 100)}%</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
