# Lastly

**When did you last…?** A gentle tracker for the small upkeep of life — the sheets, the toothbrush, the call to Mom — so nothing quietly goes stale.

Not a todo list. Lastly tracks *time since* you last did a thing, and shows freshness as a ring that slowly drains from sage green through honey amber to ember red.

## How it works

- **Add a thing** you want to keep fresh, how often it should happen, and when you last did it.
- **Watch the ring.** Full and green means fresh; drained and red means it's been too long. The most-overdue items float to the top.
- **Hold a card** when you've just done it — the ring bursts and refills. Undo if you fat-fingered it.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) for spring physics, layout animations, and the hold-to-reset interaction
- localStorage persistence — no accounts, no API, no backend
- Installable PWA (Add to Home Screen)

## Develop

```bash
npm install
npm run dev
```

Icons are generated from `scripts/icon-source.svg`:

```bash
node scripts/gen-icons.mjs
```

## Design

Pine-ink dark theme where freshness itself is the palette (sage → honey → ember). Fraunces italic for the wordmark and time numerals, Figtree for UI. Respects `prefers-reduced-motion`.
