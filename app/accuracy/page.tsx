import { ProofOfAccuracyChart } from "@/components/proof-of-accuracy-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/dashboard-service";
import { formatSek } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccuracyPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot(params?.site);
  const latestRecommendation = snapshot.recommendations[0];
  const turnoverMap = snapshot.turnovers.reduce<Record<string, number>>((acc, item) => {
    acc[item.market] = item.turnoverSek;
    return acc;
  }, {});

  const estimatedBenefitSek = latestRecommendation
    ? latestRecommendation.fcr_split * (turnoverMap["FCR-D"] ?? 0) +
      latestRecommendation.mfrr_split * (turnoverMap["mFRR"] ?? 0) +
      latestRecommendation.mfrr_cm_split * (turnoverMap["mFRR"] ?? 0) +
      latestRecommendation.spot_split * (turnoverMap["Spot"] ?? 0)
    : 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 md:px-10 md:py-10">
      <header className="mb-6">
        <Badge className="mb-3 border-white/20 bg-slate-900/65" variant="default">
          MODEL VALIDATION
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">Model Accuracy</h1>
      </header>

      <Card className="mb-5 neon-glow-card">
        <CardHeader>
          <CardTitle>Technical Validation (30h–48h Prediction Window)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-slate-300">
          This panel compares known historical actuals against model forecast outputs in the critical
          30h–48h bidding horizon. It is designed to demonstrate forecast stability, directional quality,
          and decision confidence before market commitment.
        </CardContent>
      </Card>

      <ProofOfAccuracyChart timeline={snapshot.timeline} />

      <Card className="mt-5 neon-glow-card">
        <CardHeader>
          <CardTitle>Optimized Bid Split Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-slate-300">
          {latestRecommendation ? (
            <>
              Recommended Action: {Math.round(latestRecommendation.fcr_split * 100)}% FCR-D /{" "}
              {Math.round(latestRecommendation.mfrr_split * 100)}% mFRR /{" "}
              {Math.round(latestRecommendation.spot_split * 100)}% Spot → Estimated Benefit:{" "}
              <span className="font-semibold text-[var(--accent)]">{formatSek(estimatedBenefitSek, 0)}</span>
            </>
          ) : (
            "Data Gap: recommendation split is unavailable for this horizon."
          )}
        </CardContent>
      </Card>
    </main>
  );
}
