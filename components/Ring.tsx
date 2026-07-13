"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

type Props = {
  /** 0 = just done, 1 = due, >1 = overdue */
  ratio: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  /** 0→1 while the user holds to reset; drawn as a white overlay ring */
  holdProgress?: MotionValue<number>;
  children?: React.ReactNode;
};

export default function Ring({
  ratio,
  color,
  size = 60,
  strokeWidth = 4,
  holdProgress,
  children,
}: Props) {
  const reduceMotion = useReducedMotion();
  const fallback = useMotionValue(0);
  const hold = holdProgress ?? fallback;
  const holdOpacity = useTransform(hold, [0, 0.06], [0, 0.9]);

  const c = size / 2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const remaining = Math.max(0, 1 - Math.min(ratio, 1));
  const overdue = ratio >= 1;

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      {overdue && !reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 14px ${color}` }}
          animate={{ opacity: [0.12, 0.45, 0.12] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--color-track)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{
            strokeDashoffset: circumference * (1 - remaining),
            stroke: color,
            filter: `drop-shadow(0 0 3px ${color})`,
          }}
          transition={{ type: "spring", stiffness: 55, damping: 16 }}
        />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--color-mist)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ pathLength: hold, opacity: holdOpacity }}
        />
      </svg>
      <span className="absolute text-xl leading-none">{children}</span>
    </div>
  );
}
