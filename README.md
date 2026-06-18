# KSSR Adventure Academy 🦧🎓

A **play-first** educational gaming platform for Malaysian primary school
students (KSSR, Darjah 1–6) covering **Mathematics, Bahasa Melayu and English**.
Children switch lanes in an endless runner to catch the correct answer — they
feel like they're playing a mobile game, and the learning rides along inside it.

## 📂 What's here

| Path | Description |
|------|-------------|
| [`kssr-platform/`](./kssr-platform) | The production monorepo (Next.js 15 + Phaser 3 + data-driven curriculum). See its [README](./kssr-platform/README.md) and [ARCHITECTURE](./kssr-platform/ARCHITECTURE.md). |
| `KSSR-Adventure-Academy.html` | The original single-file prototype (open directly in a browser). |

## 🚀 Live site

Deployed automatically to **GitHub Pages** via GitHub Actions on every push to
`main`. Once the first deploy finishes, the game is available at:

```
https://<your-username>.github.io/<repo-name>/
```

## 🛠 Run locally

```bash
cd kssr-platform
npm install
npm run build:packages
npm run dev        # http://localhost:3000
```

## 🎮 How to play

Pick an avatar, name and year → choose a subject + topic → pick a **game mode**:

- 📇 **Flashcards** — learn the concept first (with pronunciation audio)
- ❓ **Quiz** — answer questions with streaks, hints and instant feedback
- 🫧 **Bubble Pop** — tap the correct rising bubble
- 🧩 **Memory Match** — match each question to its answer
- 🏃 **Endless Runner** — steer into the correct-answer lane

Correct answers reward XP, coins and stars; wrong answers gently re-present the
question — never a "game over". Tap 📊 for the parent dashboard and printable
certificates; 🔊 toggles music; EN/BM switches language live.
