# 📚 Ortizzle Summer Reading Challenge

A family reading tracker built as a single-file Progressive Web App (PWA), synced via GitHub Gist. Built for the Ortiz family's 2026 Summer Reading Challenge.

**Live app:** [ortizzle.github.io/Summer_Reading](https://ortizzle.github.io/Summer_Reading)

---

## Family Members

| Member | Role | Emoji |
|--------|------|-------|
| Chris | Adult / Admin | 👨🏾 |
| Kat | Adult | 👩🏾 |
| Sedona | Kid | 🧒🏾 |
| River | Kid | 🌊 |
| Hani | Adult | ⭐ |

---

## Features

### 📖 Reading Log (Log Tab)
- **Start/End Calculator** — enter clock times to auto-calculate minutes read
- **Timer** — built-in stopwatch for active reading sessions
- **Double-log prevention** — `_logBusy` lock with "⏳ Saving…" button feedback prevents duplicate entries on slow networks
- **Journal prompt** — after logging a session, a bottom-sheet prompt invites you to write a journal entry for that book

### 🏠 Home Tab
- **Now Reading** — shows each member's current books with cover art
- **Book summaries** — tap a book to see a Google Books description + estimated finish time
- **Finish time estimate** — calculated from each member's actual daily reading pace (28-day rolling average)
- **Family Goal progress bar** — shows total points, previous milestone marker, and next goal emoji
- **Individual contribution bars** — each member's bar is scaled to the next family milestone (not relative to top scorer)
- **Reading streaks** — consecutive daily reading tracked per member

### 🎲 Bingo Tab
- **June card** — active through June 30
- **July/August card** — activates July 1
- **Cards by member type:** Kids, Adults, Hani (dog-sitting themed)
- **Kids on adult card** — earn half points to keep the economy balanced
- **Retroactive half-point migration** — existing adult-card entries for Sedona & River were adjusted automatically
- **Bingo repair** — visual state is always rebuilt from immutable session history on load

### 📓 Journal Tab
- **Notebook view** — one collapsible notebook per book, color-coded by index
- **Entries** — timestamped, editable journal entries per book

### 💬 Exchange Tab (Family Feed)
- **Messages** — text posts with emoji reactions
- **Photos** — camera roll picker with canvas compression (max 600px wide, 70% JPEG)
- **Book recommendations** — share what you're reading
- **Feed filters** — filter by type (messages, photos, recs, etc.)
- **Now Reading strip** — shows what everyone's currently reading

### 🔥 Streaks & Bonuses
- **Streak milestones:** 3, 5, 7, 10, 14, 20, 25, 30, 40, 50, 60, and 72 days — each worth `days × 10` bonus points (e.g. 7-day = 70 pts, 72-day "Perfect Summer" = 720 pts)
- **One-time per milestone** — bonus awarded once and tracked in `state.streakMilestones`
- **Retroactive migration** — `migrateStreakBonuses()` runs on init to award any bonuses earned before the feature existed

### 🌵 Maricopa County Reads Checklist
- Shown at the top of the Log tab
- Day-by-day checklist of reading sessions during the library program window (**June 1 – July 20, 2026**)
- Tap any day to mark it as submitted to [maricopacountyreads.org](https://maricopacountyreads.org/en-US)
- Green checkmark = submitted; tracks per member in `state.maricopaLogged`

### 🏆 Family Goals

| Points | Reward | Status |
|--------|--------|--------|
| 2,000 | 🍦 Family Reading Club — Ice cream outing | ✅ Earned |
| 7,500 | 🍨 Sundae Funday — Ice cream sundae night | |
| 15,000 | 🎬 Summer Scholars — Movie marathon night | |
| 25,000 | 🍽️ Championship Readers — Kids pick the restaurant | |

---

## Technical Details

### Stack
- **Frontend:** Single-file HTML/CSS/JS (`index.html`) — no build step, no dependencies
- **Data sync:** GitHub Gist (read/write via API with personal access token)
- **Fonts:** Fraunces (display) + DM Sans (body) via Google Fonts
- **PWA:** `manifest.json` + `sw.js` (service worker)

### Timezone
Arizona is always **UTC−7** (no DST). All date strings use `azDateStr()` which subtracts `7 × 3600 × 1000ms` from UTC. Never rely on `new Date().getHours()` for display.

### Points / Sessions Architecture
- All reading activity is stored as **sessions** in `state.sessions[memberId][]`
- Sessions are **immutable history** — never deleted, only added
- Non-reading session types (bingo wins, bonuses, etc.) are excluded from reading time via:
  ```js
  const NON_READING = ['bingo','bingo_line','bingo_bonus','bingo_corners','bingo_x','bingo_full',
                       'library','journal','finish_bonus','streak_bonus'];
  ```
  Plus title filters: `!(s.bookTitle||'').includes('(finish bonus)')` and `(s.bookTitle||'') !== 'Bingo Square'`

### Sync
- `saveToGist()` — writes full state JSON to Gist
- `loadFromGist()` — fetches with `cache: 'no-store'` to prevent stale reads
- **Bingo merge safety:** `preMergeBingo` is captured before the Gist overwrite so local completions survive a sync
- **Auto-sync on foreground:** `visibilitychange` event triggers a Gist reload whenever the app comes back into view

### Service Worker (`sw.js` — v3)
- **`index.html`** → network-first (ensures code updates land immediately; only 2xx responses overwrite the cached copy)
- **GitHub API / Google Books API** → network-only (live data, never cached; failures reject so the app can show a real error instead of a fake success)
- **Icons, manifest** → cache-first (fast offline load)

### PWA Install
- **Android (Chrome):** three-dot menu → "Add to Home Screen"
- **iOS (Safari):** Share → "Add to Home Screen"
- Icons generated from `ortiz-crest.png` at 192×192 and 512×512

---

## Files

```
Summer_Reading/
├── index.html          # Entire app — HTML, CSS, JS
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (v2)
├── icon-192.png        # PWA icon
├── icon-512.png        # PWA icon
├── apple-touch-icon.png
└── README.md
```

---

## Development Notes

- **Never use `git push` in terminal** — terminal is not authenticated. Push via **GitHub Desktop** only.
- The Gist token is **not** stored in the repo — it lives in each device's `localStorage` (entered via Settings). Keep it that way: never hardcode a token into `index.html`, since this repo is public.
- The Settings "share link" embeds the token in a URL query param — only send it over private channels (the app strips it from the address bar on load, but it remains in the message thread it was shared through).
- To force all devices to reload a new version, bump the cache name in `sw.js` (e.g., `ortizzle-v3` → `ortizzle-v4`).
- Google Books API is used without a key: `https://www.googleapis.com/books/v1/volumes?q=...`

---

*Built with ☀️ for the Ortiz family — Summer 2026*
