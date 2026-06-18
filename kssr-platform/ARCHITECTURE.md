# Architecture

## 1. Product shape

KSSR Adventure Academy is a gamified learning platform. The learning loop is:

```
Learn (flashcards) → Play (runner/race/adventure) → Reward → Progress → Unlock → Repeat
```

Three game modes consume the **same** curriculum data:

- **Endless Runner** (primary) — auto-run; challenges become lanes/gates/tokens.
- **Racing** (secondary) — answer lanes, challenge gates, knowledge boosters.
- **Adventure / Boss** — story missions and educational boss battles for milestones.

## 2. Why this package boundary

The hard-won architectural decision is the separation between **content** and
**engine**. Game code depends only on `@kssr/shared` types and the
`@kssr/curriculum` API — never on JSON file paths or question wording. This is
what lets the catalogue grow (and become AI-generated) without regressions.

```
@kssr/shared        ← types only, zero runtime deps
   ▲          ▲
   │          │
@kssr/curriculum   (loads + validates JSON, adaptive selection)
   ▲
   │
packages/game-engine (Phaser 3 scenes)  ──►  apps/web (PWA shell)
                                              apps/admin (content authoring)
                                              server (optional sync + analytics)
```

## 3. Tech stack (target)

| Layer | Choice | Notes |
|-------|--------|-------|
| Language | TypeScript (strict) | across all packages |
| Game engine | Phaser 3 | scenes per mode, data-driven challenges |
| Web shell | Next.js 15 (App Router) **or** Vite PWA | see §7 |
| UI | Tailwind CSS, shadcn/ui, Framer Motion | large touch targets, juicy transitions |
| Audio | Howler.js + Web Speech API | SFX + flashcard pronunciation |
| State | Zustand + persisted store | offline-first |
| Local persistence | IndexedDB (via `idb`/`localforage`) + localStorage fallback | the save document is `PlayerSave` |
| Backend | NestJS | optional; sync, leaderboards, classroom mgmt |
| Database | PostgreSQL + Prisma ORM | schema in `server/prisma/schema.prisma` |
| Auth | NextAuth (parent/teacher), anonymous child profiles | child accounts are device-local by default |
| Analytics | custom event reducer (`@kssr/shared` events) → dashboard metrics | batched sync to backend |
| Delivery | PWA (installable), Android/iOS wrapper (Capacitor) | |
| Deploy | Vercel (web) + Railway/Render (api) + managed Postgres | Docker for api |

## 4. Data flow

1. Player selects **Year → Subject → Topic** (`@kssr/curriculum.getTopics`).
2. **Learn Mode** renders the topic's flashcards.
3. The **engine** asks the selector for the next challenge
   (`nextChallenge(topic, { mastery, seenCorrect })`) — difficulty is paced to
   the rolling mastery EMA (`updateMastery`).
4. The challenge is rendered as a gameplay obstacle (lane/gate/collect).
5. On answer, the engine emits a `challenge_answered` analytics event and
   grants a `RewardBundle`.
6. The analytics reducer folds events into `DashboardMetrics` for parents.
7. `PlayerSave` is persisted locally and (optionally) synced to the backend.

## 5. Curriculum content model

Authored as JSON per `(year, subject)` slice; see
`packages/curriculum/src/data/`. Every file is validated on load
(`validateSubjectCurriculum`) with precise error paths, guaranteeing:

- exactly one correct option per challenge,
- localized (`en`/`ms`) prompts, hints, fun facts,
- at least one skill tag (for analytics + adaptive selection),
- ≥ 1 challenge per topic.

Adding **Years 4–6** is purely additive: drop in JSON files and extend
`COVERAGE`. An AI generation pipeline can target the same schema and run through
the same validator before publishing.

## 6. Gamification

- **Currencies:** XP, Coins, Stars, Knowledge Points (earned only via learning).
- **Ranks:** Year 1 Explorer → Year 6 Legend (`RANKS`).
- **Achievements & missions:** declarative defs (`AchievementDef`, `MissionDef`)
  with engine-detectable triggers — new ones need no engine changes.
- **Streaks:** daily/weekly/monthly with consistency rewards.
- **Unlocks:** characters, pets, vehicles, trails, costumes, worlds, titles.

## 7. Web shell decision (Next.js vs Vite)

The spec lists **Next.js 15**. For an offline-first kids' game the SSR surface
is small (mostly the parent/teacher dashboard + auth). Two valid paths:

- **Next.js 15** — best when we need SSR marketing pages, NextAuth, server
  components for the parent dashboard, and a unified deploy on Vercel.
- **Vite + React PWA** — lighter, faster cold loads on low-end Android, trivial
  Capacitor wrapping; pair with a standalone NestJS API for any server needs.

Both consume identical `@kssr/*` packages, so this choice does not affect the
core. The current foundation is framework-agnostic by design.

## 8. Roadmap

- **M1 (done):** monorepo, `@kssr/shared`, `@kssr/curriculum` (Y1–3) + tests.
- **M2:** `packages/game-engine` — Phaser 3 runner scene + challenge renderer +
  reward FX, driven by the selector.
- **M3:** `apps/web` — PWA shell, year/subject/topic select, Learn Mode,
  progression store, parent dashboard, printable certificates.
- **M4:** Years 4–6 content; achievements/missions engine; boss & race modes.
- **M5:** `server` (NestJS + Prisma) sync, classroom dashboards, leaderboards.
