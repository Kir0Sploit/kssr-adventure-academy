# KSSR Adventure Academy — Platform

A **play-first** educational gaming platform for Malaysian primary school
students (KSSR, Darjah 1–6) across **Mathematics, Bahasa Melayu and English**.
Children should feel they are playing a polished mobile game; the learning is
embedded inside the gameplay (runner lanes, answer gates, treasure unlocks).

> This repository is the engineered foundation of that product. It is built in
> verifiable milestones rather than as one unverifiable dump of code.

## Monorepo layout

```
kssr-platform/
├─ package.json            # npm workspaces root
├─ tsconfig.base.json      # shared TS config
├─ packages/
│  ├─ shared/              # @kssr/shared      — domain types (zero deps)
│  ├─ curriculum/          # @kssr/curriculum  — data-driven KSSR content + loader
│  │  └─ src/data/yearN/{math,bm,english}.json
│  └─ game-engine/         # @kssr/game-engine — Phaser 3 endless runner
├─ apps/
│  └─ web/                 # @kssr/web         — Next.js 15 PWA shell
└─ server/                 # backend contract (Prisma schema + API surface)
```

## Status

| Area | Package | State |
|------|---------|-------|
| Domain model | `@kssr/shared` | ✅ builds (`tsc -b`) |
| Data-driven curriculum (Y1–Y3 × 3 subjects) | `@kssr/curriculum` | ✅ builds + ✅ 8 tests pass |
| Adaptive selector + mastery model | `@kssr/curriculum` | ✅ tested |
| Phaser 3 endless-runner engine | `@kssr/game-engine` | ✅ builds (`tsc -b`) |
| Next.js 15 PWA web shell | `@kssr/web` | ✅ `next build` passes + serves 200 |
| Backend data model | `server/prisma/schema.prisma` | ✅ schema authored |
| Years 4–6 content | `@kssr/curriculum` | ⏭ identical schema, AI-ready |

The single-file playable prototype lives at
`../KSSR-Adventure-Academy.html` and demonstrates the gameplay feel this
platform productionises.

## Getting started

```bash
npm install
npm run build:packages   # build @kssr/shared, @kssr/curriculum, @kssr/game-engine
npm run test:curriculum  # run curriculum integrity tests (8 passing)
npm run dev              # start the Next.js app at http://localhost:3000
# or
npm run build:all && npm run start   # production build + serve
```

### Playing
Pick an avatar/name/year → choose a subject + topic → **Learn** (flashcards) →
**Play** the endless runner: switch lanes (arrow keys, tap, or swipe) into the
lane holding the correct answer. Correct answers reward XP/coins/stars and speed
you up; wrong answers gently re-present the question — never a "game over".
Tap 📊 for the parent dashboard and printable certificates.

## Design principles

1. **Play first, learn second.** Questions are gameplay actions, never exam screens.
2. **Curriculum is data, not code.** Content lives in JSON validated at load
   time, so new topics (or AI-generated content) drop in without touching the
   engine. See `packages/curriculum`.
3. **Positive only.** No punishment or shame; randomised praise + scaffolded
   hints that never reveal the answer.
4. **Offline-first.** Progress persists client-side; the backend is an optional
   sync layer.
5. **Mobile-first.** Min 48px touch targets, portrait + landscape, PWA installable.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full technical design.
