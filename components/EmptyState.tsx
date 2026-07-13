"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PRESETS, type Preset } from "@/lib/lastly";

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
      className="mt-16"
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
        Lastly keeps time on the small upkeep of life, so nothing quietly goes
        stale. Start with one:
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {PRESETS.slice(0, 6).map((p, i) => (
          <motion.button
            key={p.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 24,
              delay: 0.25 + i * 0.06,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPick(p)}
            className="flex items-center gap-3 rounded-card border border-line-soft bg-surface px-4 py-3 text-left"
          >
            <span className="text-xl">{p.emoji}</span>
            <span className="flex-1 text-[15px]">{p.name}</span>
            <span className="text-[13px] text-moss">+</span>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.97 }}
        onClick={onCustom}
        className="mt-4 w-full rounded-card border border-dashed border-line px-4 py-3 text-[14px] text-moss"
      >
        or track something of your own
      </motion.button>
    </motion.div>
  );
}
