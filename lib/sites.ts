import type { SiteConfig } from "@/types/market";

export const sites: SiteConfig[] = [
  {
    id: "1011",
    name: "Uddevalla Halleröd",
    capacity: 5,
    type: "BESS + Solar",
    soc: 62,
    status: "discharging",
    livePowerMw: 0.079,
  },
  {
    id: "1012",
    name: "Västerås Hamn",
    capacity: 4.2,
    type: "BESS",
    soc: 54,
    status: "charging",
    livePowerMw: 0.061,
  },
  {
    id: "1013",
    name: "Enköping Gridpoint",
    capacity: 6,
    type: "BESS + Solar",
    soc: 71,
    status: "idle",
    livePowerMw: 0,
  },
  {
    id: "1014",
    name: "Uppsala Sävja",
    capacity: 3.5,
    type: "BESS",
    soc: 47,
    status: "charging",
    livePowerMw: 0.043,
  },
  {
    id: "1015",
    name: "Norrköping Bråviken",
    capacity: 7,
    type: "BESS + Wind",
    soc: 66,
    status: "discharging",
    livePowerMw: 0.11,
  },
  {
    id: "1016",
    name: "Eskilstuna Park",
    capacity: 2.8,
    type: "BESS",
    soc: 58,
    status: "idle",
    livePowerMw: 0,
  },
  {
    id: "1017",
    name: "Örebro North",
    capacity: 5.7,
    type: "BESS + Solar",
    soc: 63,
    status: "discharging",
    livePowerMw: 0.086,
  },
  {
    id: "1018",
    name: "Södertälje Port",
    capacity: 4.9,
    type: "BESS",
    soc: 52,
    status: "charging",
    livePowerMw: 0.057,
  },
];

export function getSiteById(siteId?: string) {
  if (!siteId) return sites[0];
  return sites.find((site) => site.id === siteId) ?? sites[0];
}
