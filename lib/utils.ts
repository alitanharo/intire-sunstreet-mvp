import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSek(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("sv-SE", {
    maximumFractionDigits,
  }).format(value);
}

export function formatMw(value: number, maximumFractionDigits = 3) {
  return `${formatNumber(value, maximumFractionDigits)} MW`;
}
