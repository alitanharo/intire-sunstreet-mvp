import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intire Sunstreet MVP | Energy Bidding Optimization",
  description:
    "Executive dashboard for 48h ancillary/spot bidding optimization in SE3 with turnover logic and agentic strategy insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<div className="h-[78px] border-b border-white/10 bg-slate-950/70" />}>
          <Header />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
