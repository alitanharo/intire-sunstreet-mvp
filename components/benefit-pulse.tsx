"use client";

import { motion } from "framer-motion";

interface BenefitPulseProps {
  value: string;
}

export function BenefitPulse({ value }: BenefitPulseProps) {
  return (
    <motion.span
      initial={{ opacity: 0.7, scale: 0.98 }}
      animate={{ opacity: 1, scale: [1, 1.03, 1] }}
      transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.8 }}
      className="font-semibold text-[var(--accent)]"
    >
      {value}
    </motion.span>
  );
}
