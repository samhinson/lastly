"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "motion/react";
import Ring from "./Ring";
import {
  type Item,
  freshnessRatio,
  freshnessColor,
  elapsedParts,
  intervalLabel,
  lastDone,
} from "@/lib/lastly";

const HOLD_SECONDS = 0.6;

type Props = {
  item: Item;
  now: number;
  index: number;
  onReset: (item: Item) => void;
  onOpen: (item: Item) => void;
};

export default function ItemCard({ item, now, index, onReset, onOpen }: Props) {
  const ratio = freshnessRatio(item, now);
  const color = freshnessColor(ratio);
  const { n, unit } = elapsedParts(now - lastDone(item));

  const hold = useMotionValue(0);
  const scale = useTransform(hold, [0, 1], [1, 0.96]);
  const holdAnim = useRef<ReturnType<typeof animate> | null>(null);
  const pressStart = useRef(0);
  const fired = useRef(false);
  const [burst, setBurst] = useState(0);

  const startHold = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pressStart.current = Date.now();
    fired.current = false;
    holdAnim.current?.stop();
    holdAnim.current = animate(hold, 1, {
      duration: HOLD_SECONDS,
      ease: "linear",
      onComplete: () => {
        fired.current = true;
        setBurst((b) => b + 1);
        onReset(item);
        animate(hold, 0, { duration: 0.35, ease: "easeOut" });
      },
    });
  };

  const cancelHold = () => {
    holdAnim.current?.stop();
    if (!fired.current) {
      animate(hold, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  const handleClick = () => {
    // A long-but-incomplete press was a reset attempt, not a tap
    if (fired.current || Date.now() - pressStart.current > 300) return;
    onOpen(item);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        delay: Math.min(index * 0.045, 0.35),
      }}
    >
      <motion.div
        style={{ scale }}
        className="relative flex cursor-pointer touch-pan-y select-none items-center gap-4 rounded-card border border-line-soft bg-surface px-4 py-3.5"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onClick={handleClick}
      >
        <Ring ratio={ratio} color={color} holdProgress={hold}>
          {item.emoji}
        </Ring>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium">{item.name}</p>
          <p className="mt-0.5 text-[13px] text-moss">
            {intervalLabel(item.intervalDays)}
            {ratio >= 1 && (
              <span style={{ color }}> · overdue</span>
            )}
          </p>
        </div>

        <div className="text-right">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={n + unit}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="font-display text-[26px] italic leading-none"
              style={{ color }}
            >
              {n}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-[11px] text-moss">{unit}</p>
        </div>

        <AnimatePresence>
          {burst > 0 && <Burst key={burst} color={color} />}
        </AnimatePresence>
      </motion.div>
    </motion.li>
  );
}

function Burst({ color }: { color: string }) {
  return (
    <span className="pointer-events-none absolute left-[46px] top-1/2">
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ background: color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * 38,
              y: Math.sin(angle) * 38,
              opacity: 0,
              scale: 0.2,
            }}
            transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 1] }}
          />
        );
      })}
    </span>
  );
}
