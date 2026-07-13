"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ItemCard from "@/components/ItemCard";
import Sheet, { type SheetResult } from "@/components/Sheet";
import EmptyState from "@/components/EmptyState";
import {
  type Item,
  type Preset,
  DAY,
  uid,
  loadItems,
  saveItems,
  freshnessRatio,
} from "@/lib/lastly";

type Toast = { msg: string; snapshot: Item[] };

export default function Home() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(loadItems());
  }, []);

  useEffect(() => {
    if (items !== null) saveItems(items);
  }, [items]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(Date.now());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const showToast = (msg: string, snapshot: Item[]) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, snapshot });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const resetItem = (item: Item) => {
    if (!items) return;
    showToast(`${item.name} — done`, items);
    setItems(
      items.map((it) =>
        it.id === item.id ? { ...it, history: [...it.history, Date.now()] } : it
      )
    );
  };

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setSheetOpen(true);
  };

  const handleSave = (data: SheetResult) => {
    if (!items) return;
    if (editing) {
      setItems(
        items.map((it) =>
          it.id === editing.id
            ? { ...it, name: data.name, emoji: data.emoji, intervalDays: data.intervalDays }
            : it
        )
      );
    } else {
      const offsetMs =
        data.lastOffsetDays === -1
          ? data.intervalDays * DAY
          : data.lastOffsetDays * DAY;
      const ts = Date.now() - offsetMs;
      setItems([
        ...items,
        {
          id: uid(),
          name: data.name,
          emoji: data.emoji,
          intervalDays: data.intervalDays,
          history: [ts],
          createdAt: ts,
        },
      ]);
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!items) return;
    const item = items.find((it) => it.id === id);
    showToast(`${item?.name ?? "Item"} deleted`, items);
    setItems(items.filter((it) => it.id !== id));
    setSheetOpen(false);
  };

  const addPreset = (preset: Preset) => {
    if (!items) return;
    // Presets arrive with an honest default: assume it's due now
    const ts = Date.now() - preset.intervalDays * DAY;
    setItems([
      ...items,
      { id: uid(), ...preset, history: [ts], createdAt: ts },
    ]);
  };

  const undo = () => {
    if (!toast) return;
    setItems(toast.snapshot);
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  };

  const sorted = items
    ? [...items].sort((a, b) => freshnessRatio(b, now) - freshnessRatio(a, now))
    : [];
  const staleCount = sorted.filter((it) => freshnessRatio(it, now) >= 1).length;

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-36 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl italic tracking-tight">Lastly</h1>
        {items !== null && items.length > 0 && (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={staleCount}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-[13px] text-moss"
            >
              {staleCount === 0
                ? "everything’s fresh"
                : `${staleCount} need${staleCount === 1 ? "s" : ""} attention`}
            </motion.p>
          </AnimatePresence>
        )}
      </header>

      {items !== null && items.length === 0 && (
        <EmptyState onPick={addPreset} onCustom={openAdd} />
      )}

      {items !== null && items.length > 0 && (
        <>
          <p className="mt-1 text-[13px] text-moss">
            hold a card when you’ve just done it
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            <AnimatePresence initial={false} mode="popLayout">
              {sorted.map((item, i) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  now={now}
                  index={i}
                  onReset={resetItem}
                  onOpen={openEdit}
                />
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}

      {items !== null && items.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.3 }}
          whileTap={{ scale: 0.88 }}
          onClick={openAdd}
          aria-label="Track something new"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-1/2 z-30 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-sage text-2xl font-light text-ink shadow-[0_8px_30px_rgba(143,227,169,0.35)]"
        >
          +
        </motion.button>
      )}

      <Sheet
        open={sheetOpen}
        editing={editing}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] left-1/2 z-30 flex w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 items-center justify-between rounded-2xl border border-line-soft bg-surface-2 px-4 py-3 shadow-xl"
          >
            <span className="truncate text-[14px]">{toast.msg}</span>
            <button
              onClick={undo}
              className="ml-3 shrink-0 text-[14px] font-semibold text-sage"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
