"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { type Preset } from "@/lib/lastly";

const SIZES = [96, 84, 102, 88, 94];

type Props = {
  presets: Preset[];
  onPick: (p: Preset) => void;
  onCustom: () => void;
};

export default function BubbleField({ presets, onPick, onCustom }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {presets.map((p, i) => (
        <Bubble
          key={p.name}
          index={i}
          size={SIZES[i % SIZES.length]}
          emoji={p.emoji}
          label={p.short}
          onDone={() => onPick(p)}
        />
      ))}
      <Bubble
        index={presets.length}
        size={88}
        emoji="＋"
        label="Custom"
        custom
        onDone={onCustom}
      />
    </div>
  );
}

function Bubble({
  index,
  size,
  emoji,
  label,
  custom = false,
  onDone,
}: {
  index: number;
  size: number;
  emoji: string;
  label: string;
  custom?: boolean;
  onDone: () => void;
}) {
  const reduce = useReducedMotion();
  const [popped, setPopped] = useState(false);

  const handleClick = () => {
    if (popped) return;
    setPopped(true);
    setTimeout(onDone, 300);
  };

  const delay = Math.min(index * 0.05, 0.5);
  const bobDuration = 3.2 + (index % 5) * 0.45;

  return (
    <motion.div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      initial={{ scale: 0, opacity: 0 }}
      animate={
        reduce
          ? { scale: 1, opacity: 1 }
          : { scale: 1, opacity: 1, y: [0, -8, 0] }
      }
      transition={{
        scale: { type: "spring", stiffness: 260, damping: 18, delay },
        opacity: { duration: 0.3, delay },
        y: {
          duration: bobDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.3,
        },
      }}
    >
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        animate={popped ? { scale: [1, 1.3, 0.2], opacity: [1, 1, 0] } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`grid h-full w-full place-items-center rounded-full border ${
          custom ? "border-dashed border-line" : "border-line-soft"
        }`}
        style={
          custom
            ? undefined
            : {
                background:
                  "radial-gradient(circle at 34% 28%, rgba(143,227,169,0.18), rgba(19,26,21,0.92) 72%)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)",
              }
        }
        aria-label={custom ? "Track something custom" : label}
      >
        <span className="flex flex-col items-center gap-1">
          <span className={custom ? "text-[24px] font-light leading-none text-moss" : "text-[26px] leading-none"}>
            {emoji}
          </span>
          <span
            className={`px-1 text-[11px] leading-tight ${
              custom ? "text-moss" : "text-mist/85"
            }`}
          >
            {label}
          </span>
        </span>
      </motion.button>

      {popped && !reduce && <Pop />}
    </motion.div>
  );
}

function Pop() {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-sage"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * 46,
              y: Math.sin(angle) * 46,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.55, ease: [0.2, 0.65, 0.3, 1] }}
          />
        );
      })}
    </span>
  );
}
