import { ProofOfAccuracyChart } from "@/components/proof-of-accuracy-chart";
import { BenefitPulse } from "@/components/benefit-pulse";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/dashboard-service";
import {
  calculateFcrDTurnover,
  calculateFcrNTurnover,
  calculateMfrrTurnover,
  EURO_TO_SEK,
} from "@/lib/turnover-logic";
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
  const currentWindow = snapshot.forecast[0];
  const fallbackCounts = snapshot.hourlyWinners.reduce(
    (acc, item) => {
      if (item.market === "FCR-D") acc.fcr += 1;
      if (item.market === "mFRR") acc.mfrr += 1;
      if (item.market === "Spot") acc.spot += 1;
      return acc;
    },
    { fcr: 0, mfrr: 0, spot: 0 },
  );
  const totalWins = Math.max(snapshot.hourlyWinners.length, 1);

  const effectiveSplit = latestRecommendation
    ? latestRecommendation
    : {
        timestamp: new Date().toISOString(),
        bid_time_48h: snapshot.forecast.at(-1)?.timestamp ?? new Date().toISOString(),
        fcr_split: fallbackCounts.fcr / totalWins,
        mfrr_split: fallbackCounts.mfrr / totalWins,
        mfrr_cm_split: Math.min(0.2, fallbackCounts.mfrr / totalWins / 2),
        spot_split: fallbackCounts.spot / totalWins,
      };

  const turnoverNow = currentWindow
    ? {
        fcrD: calculateFcrDTurnover(currentWindow.fcrDUp, currentWindow.fcrDDown) * snapshot.activeSite.capacity,
        mfrr: calculateMfrrTurnover(currentWindow.mfrr) * snapshot.activeSite.capacity,
        fcrN: calculateFcrNTurnover(currentWindow.fcrN) * snapshot.activeSite.capacity,
        spot: currentWindow.spot * EURO_TO_SEK * snapshot.activeSite.capacity,
      }
    : { fcrD: 0, mfrr: 0, fcrN: 0, spot: 0 };

  const estimatedBenefitSek =
    effectiveSplit.fcr_split * turnoverNow.fcrD +
    effectiveSplit.mfrr_split * turnoverNow.mfrr +
    effectiveSplit.mfrr_cm_split * turnoverNow.mfrr +
    effectiveSplit.spot_split * turnoverNow.spot;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 md:px-10 md:py-10">
      <header className="mb-6">
        <Badge className="mb-3 border-white/20 bg-slate-900/65" variant="default">
          MODEL VALIDATION
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">Prediction Chart</h1>
      </header>

      <Card className="mb-5 neon-glow-card">
        <CardHeader>
          <CardTitle>PREDICTION CHART</CardTitle>
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
              Recommended Action: {Math.round(effectiveSplit.fcr_split * 100)}% FCR-D /{" "}
              {Math.round(effectiveSplit.mfrr_split * 100)}% mFRR /{" "}
              {Math.round(effectiveSplit.spot_split * 100)}% Spot
              <br />
              Projected Bidding Window Benefit: <BenefitPulse value={formatSek(estimatedBenefitSek, 0)} />
            </>
          ) : (
            "Data Gap: recommendation split is unavailable for this horizon."
          )}
        </CardContent>
      </Card>
    </main>
  );
}
