"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type Item, EMOJIS, INTERVAL_OPTIONS } from "@/lib/lastly";

export type SheetResult = {
  name: string;
  emoji: string;
  intervalDays: number;
  /** For new items: ms to subtract from now for the first "last done".
   *  -1 means "can't remember" → treat as due right now. */
  lastOffsetDays: number;
};

/** Pre-fills a new-item sheet from a chosen suggestion (still editable). */
export type Seed = { name: string; emoji: string; intervalDays: number };

const WHEN_OPTIONS = [
  { label: "Just now", off: 0 },
  { label: "Yesterday", off: 1 },
  { label: "A few days ago", off: 3 },
  { label: "A week ago", off: 7 },
  { label: "Can’t remember", off: -1 },
];

type Props = {
  open: boolean;
  editing: Item | null;
  seed?: Seed | null;
  onClose: () => void;
  onSave: (data: SheetResult) => void;
  onDelete: (id: string) => void;
};

export default function Sheet({
  open,
  editing,
  seed = null,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [days, setDays] = useState(7);
  const [customDays, setCustomDays] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [whenOff, setWhenOff] = useState(0);
  const [showWhenCustom, setShowWhenCustom] = useState(false);
  const [whenCustomDays, setWhenCustomDays] = useState("");

  useEffect(() => {
    if (!open) return;
    setShowWhenCustom(false);
    setWhenCustomDays("");
    const source = editing ?? seed;
    if (source) {
      setName(source.name);
      setEmoji(source.emoji);
      setDays(source.intervalDays);
      setShowCustom(!INTERVAL_OPTIONS.some((o) => o.days === source.intervalDays));
      setCustomDays(String(source.intervalDays));
      setWhenOff(0);
    } else {
      setName("");
      setEmoji(EMOJIS[0]);
      setDays(7);
      setShowCustom(false);
      setCustomDays("");
      setWhenOff(0);
    }
  }, [open, editing, seed]);

  const effectiveDays = showCustom
    ? Math.max(1, parseInt(customDays, 10) || 0)
    : days;
  const effectiveWhenOff = showWhenCustom
    ? Math.max(0, parseInt(whenCustomDays, 10) || 0)
    : whenOff;
  const valid = name.trim().length > 0 && effectiveDays >= 1;

  const save = () => {
    if (!valid) return;
    onSave({
      name: name.trim(),
      emoji,
      intervalDays: effectiveDays,
      lastOffsetDays: effectiveWhenOff,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[1.75rem] border-t border-line-soft bg-surface-2 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line" />

            <h2 className="font-display text-xl italic">
              {editing ? "Edit" : "When did you last…"}
            </h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="Wash the sheets, call Dad…"
              className="mt-4 w-full rounded-xl border border-line-soft bg-ink px-4 py-3 text-[15px] placeholder:text-moss/60"
            />

            <p className="mt-5 text-[12px] font-medium uppercase tracking-wider text-moss">
              Emoji
            </p>
            <div className="mt-2 grid grid-cols-8 gap-1">
              {EMOJIS.map((e) => (
                <motion.button
                  key={e}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setEmoji(e)}
                  className={`grid aspect-square place-items-center rounded-lg text-lg transition-colors ${
                    emoji === e ? "bg-sage/20 ring-1 ring-sage/60" : "hover:bg-ink"
                  }`}
                  aria-label={`Choose ${e}`}
                >
                  {e}
                </motion.button>
              ))}
            </div>

            <p className="mt-5 text-[12px] font-medium uppercase tracking-wider text-moss">
              How often should it happen?
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {INTERVAL_OPTIONS.map((o) => (
                <Chip
                  key={o.days}
                  active={!showCustom && days === o.days}
                  onClick={() => {
                    setShowCustom(false);
                    setDays(o.days);
                  }}
                >
                  {o.label}
                </Chip>
              ))}
              <Chip active={showCustom} onClick={() => setShowCustom(true)}>
                Custom
              </Chip>
            </div>
            {showCustom && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="21"
                  className="w-20 rounded-xl border border-line-soft bg-ink px-3 py-2 text-[15px]"
                />
                <span className="text-[13px] text-moss">days</span>
              </div>
            )}

            {!editing && (
              <>
                <p className="mt-5 text-[12px] font-medium uppercase tracking-wider text-moss">
                  When did you last do it?
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {WHEN_OPTIONS.map((o) => (
                    <Chip
                      key={o.label}
                      active={!showWhenCustom && whenOff === o.off}
                      onClick={() => {
                        setShowWhenCustom(false);
                        setWhenOff(o.off);
                      }}
                    >
                      {o.label}
                    </Chip>
                  ))}
                  <Chip
                    active={showWhenCustom}
                    onClick={() => setShowWhenCustom(true)}
                  >
                    Custom
                  </Chip>
                </div>
                {showWhenCustom && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={whenCustomDays}
                      onChange={(e) =>
                        setWhenCustomDays(e.target.value.replace(/\D/g, ""))
                      }
                      inputMode="numeric"
                      placeholder="10"
                      className="w-20 rounded-xl border border-line-soft bg-ink px-3 py-2 text-[15px]"
                    />
                    <span className="text-[13px] text-moss">days ago</span>
                  </div>
                )}
              </>
            )}

            <div className="mt-6 flex gap-2">
              {editing && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onDelete(editing.id)}
                  className="rounded-xl border border-ember/40 px-4 py-3 text-[14px] font-medium text-ember"
                >
                  Delete
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={save}
                disabled={!valid}
                className="flex-1 rounded-xl bg-sage py-3 text-[15px] font-semibold text-ink disabled:opacity-30"
              >
                {editing ? "Save changes" : "Start tracking"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
        active
          ? "border-sage/70 bg-sage/15 text-sage"
          : "border-line-soft text-moss hover:text-mist"
      }`}
    >
      {children}
    </motion.button>
  );
}
