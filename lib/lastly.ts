export type Item = {
  id: string;
  name: string;
  emoji: string;
  intervalDays: number;
  /** Timestamps of every reset, most recent last */
  history: number[];
  createdAt: number;
};

export const DAY = 86_400_000;

export const uid = () => Math.random().toString(36).slice(2, 10);

export const lastDone = (item: Item) =>
  item.history.length > 0 ? item.history[item.history.length - 1] : item.createdAt;

/** 0 = just done, 1 = due right now, >1 = overdue */
export const freshnessRatio = (item: Item, now: number) =>
  (now - lastDone(item)) / (item.intervalDays * DAY);

type RGB = [number, number, number];
const SAGE: RGB = [143, 227, 169];
const HONEY: RGB = [239, 200, 104];
const EMBER: RGB = [239, 122, 91];

const mix = (a: RGB, b: RGB, t: number): RGB =>
  [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as RGB;

export function freshnessColor(ratio: number): string {
  const t = Math.min(Math.max(ratio, 0), 1);
  const c =
    t < 0.55 ? mix(SAGE, HONEY, t / 0.55) : mix(HONEY, EMBER, (t - 0.55) / 0.45);
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function elapsedParts(ms: number): { n: string; unit: string } {
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return { n: "now", unit: "just done" };
  if (mins < 60) return { n: `${mins}`, unit: mins === 1 ? "min ago" : "mins ago" };
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return { n: `${hrs}`, unit: hrs === 1 ? "hr ago" : "hrs ago" };
  const days = Math.floor(hrs / 24);
  if (days < 21) return { n: `${days}`, unit: days === 1 ? "day ago" : "days ago" };
  const weeks = Math.floor(days / 7);
  if (days < 61) return { n: `${weeks}`, unit: "wks ago" };
  const months = Math.floor(days / 30.44);
  if (days < 548) return { n: `${months}`, unit: months === 1 ? "mo ago" : "mos ago" };
  const years = Math.floor(days / 365.25);
  return { n: `${years}`, unit: years === 1 ? "yr ago" : "yrs ago" };
}

export function intervalLabel(days: number): string {
  if (days === 1) return "every day";
  if (days === 7) return "every week";
  if (days === 14) return "every 2 weeks";
  if (days === 30) return "every month";
  if (days === 90) return "every 3 months";
  if (days === 180) return "every 6 months";
  if (days === 365) return "every year";
  if (days % 30 === 0) return `every ${days / 30} months`;
  if (days % 7 === 0) return `every ${days / 7} weeks`;
  return `every ${days} days`;
}

export type Preset = {
  name: string;
  /** Short caption shown inside a bubble */
  short: string;
  emoji: string;
  intervalDays: number;
};

export const PRESETS: Preset[] = [
  { name: "Washed the sheets", short: "Sheets", emoji: "🛏️", intervalDays: 14 },
  { name: "Called Mom", short: "Call Mom", emoji: "📞", intervalDays: 7 },
  { name: "Watered the plants", short: "Plants", emoji: "🌿", intervalDays: 4 },
  { name: "New toothbrush head", short: "Toothbrush", emoji: "🪥", intervalDays: 90 },
  { name: "Washed the towels", short: "Towels", emoji: "🧺", intervalDays: 10 },
  { name: "Backed up my laptop", short: "Backup", emoji: "💾", intervalDays: 30 },
  { name: "Got a haircut", short: "Haircut", emoji: "✂️", intervalDays: 42 },
  { name: "Cleaned the bathroom", short: "Bathroom", emoji: "🧽", intervalDays: 21 },
  { name: "Called a friend", short: "Call friend", emoji: "☎️", intervalDays: 14 },
  { name: "Replaced the water filter", short: "Water filter", emoji: "💧", intervalDays: 90 },
  { name: "Checked tire pressure", short: "Tires", emoji: "🚗", intervalDays: 60 },
  { name: "Tested the smoke alarm", short: "Smoke alarm", emoji: "🧯", intervalDays: 180 },
  { name: "Date night", short: "Date night", emoji: "🌙", intervalDays: 14 },
  { name: "Journaled", short: "Journal", emoji: "📓", intervalDays: 2 },
];

export const EMOJIS = [
  "🪥", "🛏️", "📞", "🌿", "💧", "💾", "✂️", "🧽",
  "🚗", "🧯", "🦷", "🏃", "📚", "🧺", "🍳", "🛁",
  "🐕", "🐈", "🎸", "🧴", "🌙", "☎️", "🪴", "✨",
  "📓", "🧹", "💊", "🚿", "🌱", "🔋", "🗑️", "🧼",
];

export const INTERVAL_OPTIONS: { label: string; days: number }[] = [
  { label: "Every day", days: 1 },
  { label: "3 days", days: 3 },
  { label: "Week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "Month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "Year", days: 365 },
];

const KEY = "lastly.items.v1";

export function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveItems(items: Item[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable — nothing sensible to do
  }
}
