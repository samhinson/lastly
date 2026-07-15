"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PRESETS, type Preset } from "@/lib/lastly";
import BubbleField from "./BubbleField";

const PROMPTS = [
  "wash your sheets?",
  "call your mom?",
  "water the plants?",
  "back up your laptop?",
  "change your toothbrush?",
  "test the smoke alarm?",
];

export default function EmptyState({
  onPick,
  onCustom,
}: {
  onPick: (preset: Preset) => void;
  onCustom: () => void;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PROMPTS.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="mt-12"
    >
      <h2 className="font-display text-[min(2.25rem,8.2vw)] italic leading-tight">
        When did you last
        <br />
        <span className="relative block h-[1.35em] overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.span
              key={idx}
              initial={{ y: "105%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-105%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute left-0 top-0 whitespace-nowrap text-sage"
            >
              …{PROMPTS[idx]}
            </motion.span>
          </AnimatePresence>
        </span>
      </h2>

      <p className="mt-4 text-[15px] leading-relaxed text-moss">
        Pick something to keep fresh. Tap a bubble and you’ll set the timing on
        the next screen.
      </p>

      <div className="mt-9">
        <BubbleField presets={PRESETS} onPick={onPick} onCustom={onCustom} />
      </div>
    </motion.div>
  );
}
