import { BrainCircuit, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReasoningInsight } from "@/types/market";

interface AgenticPilotProps {
  insight: ReasoningInsight;
}

function mapConfidenceToVariant(confidence: ReasoningInsight["confidence"]) {
  if (confidence === "High") return "success" as const;
  if (confidence === "Medium") return "warning" as const;
  return "danger" as const;
}

export function AgenticPilot({ insight }: AgenticPilotProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-[var(--accent)]" />
              AGENTIC PILOT
            </CardTitle>
            <CardDescription className="mt-1">Server-side reasoning from forecast + context drivers</CardDescription>
          </div>
          <Badge variant={mapConfidenceToVariant(insight.confidence)}>
            Confidence {insight.confidence}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-slate-200">{insight.summary}</p>
        <p className="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-sm font-medium text-[var(--accent)]">
          {insight.strategy}
        </p>
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-slate-400">
            <Sparkles className="h-3.5 w-3.5" />
            Key Drivers
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {insight.drivers.map((driver) => (
              <li key={driver} className="rounded-lg border border-white/10 bg-slate-950/35 px-3 py-2">
                {driver}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
