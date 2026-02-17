import { AgenticPilot } from "@/components/agentic-pilot";
import { AlphaStrategyCard } from "@/components/alpha-strategy-card";
import { HybridTimelineChart } from "@/components/hybrid-timeline-chart";
import { Badge } from "@/components/ui/badge";
import { getDashboardSnapshot } from "@/lib/dashboard-service";

export const dynamic = "force-dynamic";

export default async function StrategyPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot(params?.site);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 md:px-10 md:py-10">
      <header className="mb-6">
        <Badge className="mb-3 border-white/20 bg-slate-900/65" variant="default">
          STRATEGY ALPHA
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">Strategy Analysis</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300/95 md:text-base">
          Understand trend dynamics, AI strategy edge, and market allocation rationale for the selected site.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-10">
        <div className="xl:col-span-7">
          <HybridTimelineChart timeline={snapshot.timeline} />
        </div>
        <div className="xl:col-span-3">
          <AlphaStrategyCard strategyComparison={snapshot.strategyComparison} />
        </div>
      </section>

      <section className="mt-6">
        <AgenticPilot insight={snapshot.reasoning} />
      </section>
    </main>
  );
}
