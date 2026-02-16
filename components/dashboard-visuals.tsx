"use client";

import { motion } from "framer-motion";

import { AlphaStrategyCard } from "@/components/alpha-strategy-card";
import { HybridTimelineChart } from "@/components/hybrid-timeline-chart";
import { ProofOfAccuracyChart } from "@/components/proof-of-accuracy-chart";
import { PulseHeatmap } from "@/components/pulse-heatmap";
import type { MarketTurnoverPoint, StrategyComparison, TimelinePoint } from "@/types/market";

interface DashboardVisualsProps {
  timeline: TimelinePoint[];
  turnovers: MarketTurnoverPoint[];
  strategyComparison: StrategyComparison;
}

export function DashboardVisuals({ timeline, turnovers, strategyComparison }: DashboardVisualsProps) {
  return (
    <section className="mt-6 space-y-4">
      <motion.div
        key={`heatmap-${turnovers.map((item) => item.turnoverSek.toFixed(0)).join("-")}`}
        initial={{ opacity: 0.5, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <PulseHeatmap turnovers={turnovers} />
      </motion.div>
      <div className="grid gap-4 xl:grid-cols-10">
        <div className="xl:col-span-7">
          <HybridTimelineChart timeline={timeline} />
        </div>
        <div className="xl:col-span-3">
          <AlphaStrategyCard strategyComparison={strategyComparison} />
        </div>
      </div>
      <ProofOfAccuracyChart timeline={timeline} />
    </section>
  );
}
