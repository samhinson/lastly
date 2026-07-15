"use client";

import { motion, AnimatePresence } from "motion/react";
import { PRESETS, type Preset } from "@/lib/lastly";
import BubbleField from "./BubbleField";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (p: Preset) => void;
  onCustom: () => void;
};

export default function Picker({ open, onClose, onPick, onCustom }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 overflow-y-auto bg-ink/95 px-5 pb-24 pt-[calc(env(safe-area-inset-top)+2rem)] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl italic">Add something</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full border border-line-soft text-moss"
              >
                ✕
              </motion.button>
            </div>
            <p className="mt-1 text-[13px] text-moss">
              Tap a bubble — you’ll set the timing next.
            </p>
            <div className="mt-8">
              <BubbleField presets={PRESETS} onPick={onPick} onCustom={onCustom} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
