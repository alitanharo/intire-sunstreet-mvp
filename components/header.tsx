"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { SiteSelector } from "@/components/site-selector";
import { Badge } from "@/components/ui/badge";
import { sites } from "@/lib/sites";

type ConnectionView = {
  connected: boolean;
  sourceLabel: string;
};

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const site = searchParams.get("site") ?? sites[0].id;
  const [connection, setConnection] = useState<ConnectionView>({
    connected: true,
    sourceLabel: "Checking...",
  });

  useEffect(() => {
    let isMounted = true;

    fetch("/api/history", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;

        const source = String(json?.source ?? "unknown");
        setConnection({
          connected: source === "real",
          sourceLabel: source === "real" ? "Live Firestore" : "Unavailable",
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setConnection({ connected: false, sourceLabel: "Unavailable" });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hrefWithSite = useMemo(
    () => ({
      dashboard: `/?site=${site}`,
      strategy: `/strategy?site=${site}`,
      accuracy: `/accuracy?site=${site}`,
    }),
    [site],
  );

  const navItems = [
    { label: "Dashboard", href: hrefWithSite.dashboard, active: pathname === "/" },
    { label: "Strategy Alpha", href: hrefWithSite.strategy, active: pathname === "/strategy" },
    { label: "Model Accuracy", href: hrefWithSite.accuracy, active: pathname === "/accuracy" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-6 py-4 md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center rounded-xl border border-white/20 bg-white/95 px-3 py-2 shadow-[0_8px_24px_rgba(5,10,22,0.25)]">
            <Image
              src="/Sunstreet_Horisontell_Svart.png"
              alt="Sunstreet"
              width={170}
              height={30}
              priority
              className="h-auto w-[140px] object-contain"
            />
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  item.active
                    ? "border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-white/15 bg-slate-900/60 text-slate-300 hover:border-white/30"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SiteSelector sites={sites} activeSiteId={site} />
          <Badge
            variant={connection.connected ? "success" : "warning"}
            className="px-3 py-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            {connection.connected ? "Live Database Connected" : "Live DB Disconnected"} • {connection.sourceLabel}
          </Badge>
        </div>
      </div>
    </header>
  );
}
