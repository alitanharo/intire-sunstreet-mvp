"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { SiteConfig } from "@/types/market";

interface SiteSelectorProps {
  sites: SiteConfig[];
  activeSiteId: string;
}

export function SiteSelector({ sites, activeSiteId }: SiteSelectorProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const onSelect = (siteId: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("site", siteId);

    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  };

  return (
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Active Site</span>
      <select
        value={activeSiteId}
        onChange={(event) => onSelect(event.target.value)}
        disabled={pending}
        className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-[var(--accent)]"
      >
        {sites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.id} · {site.name}
          </option>
        ))}
      </select>
    </label>
  );
}
