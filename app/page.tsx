import { Activity, BatteryCharging, BatteryWarning, Clock3, Zap } from "lucide-react";
import Image from "next/image";

import { AgenticPilot } from "@/components/agentic-pilot";
import { DashboardVisuals } from "@/components/dashboard-visuals";
import { KpiCards } from "@/components/kpi-cards";
import { SiteSelector } from "@/components/site-selector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/dashboard-service";
import { formatMw } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusLabel(status: "charging" | "discharging" | "idle") {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot(params?.site);

  const liveStatusText = `Site #${snapshot.activeSite.id} | ${snapshot.activeSite.name.split(" ")[0]} | SOC: ${snapshot.activeSite.soc}% | ${statusLabel(snapshot.activeSite.status)} ${formatMw(snapshot.activeSite.livePowerMw)}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 md:px-10 md:py-10">
      <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-4 inline-flex items-center rounded-lg border border-white/20 bg-white/95 px-3 py-2 shadow-sm">
            <Image
              src="/Sunstreet_Horisontell_Svart.png"
              alt="Sunstreet"
              width={220}
              height={42}
              priority
              className="h-auto w-[150px] object-contain sm:w-[190px] md:w-[220px]"
            />
          </div>

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

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SiteSelector sites={snapshot.sites} activeSiteId={snapshot.activeSite.id} />
            <Badge variant="default" className="border-white/20 bg-slate-900/70 px-3 py-1.5 text-slate-100">
              {snapshot.activeSite.status === "charging" ? (
                <BatteryCharging className="mr-2 h-4 w-4 text-[var(--accent)] soc-charging" />
              ) : (
                <BatteryWarning className="mr-2 h-4 w-4 text-[var(--warning)] soc-discharging" />
              )}
              {liveStatusText}
            </Badge>
            <Badge
              variant={snapshot.connection.connected ? "success" : "warning"}
              className="px-3 py-1.5"
              title={snapshot.connection.message}
            >
              {snapshot.connection.connected ? "Live Database Connected" : "Live DB Disconnected"} •{" "}
              {snapshot.connection.sourceLabel}
            </Badge>
          </div>
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

      <KpiCards
        topMarketRecommendation={snapshot.topRecommendation}
        turnover48hSek={snapshot.turnover48hSek}
        revenueAlphaPct={snapshot.strategyComparison.revenueAlphaPct}
        budgetProgressPct={snapshot.budgetProgressPct}
      />

      <DashboardVisuals
        timeline={snapshot.timeline}
        turnovers={snapshot.turnovers}
        strategyComparison={snapshot.strategyComparison}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-4">
          <AgenticPilot insight={snapshot.reasoning} />
        </div>
        <div className="lg:col-span-1">
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
