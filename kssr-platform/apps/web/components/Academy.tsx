"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Catalog } from "@/lib/catalog";
import { useProgress } from "@/lib/store";
import { audio } from "@/lib/audio";
import type { SubjectId, Topic, Year } from "@kssr/shared";
import Hud from "./Hud";
import LearnMode from "./LearnMode";
import GameSelect from "./GameSelect";
import ParentDashboard from "./ParentDashboard";
import { getMode } from "@/lib/games";
import type { GameSummary } from "@/lib/gameUtils";

const AVATARS = ["🦸", "🦸‍♀️", "🧒", "👧", "🧑‍🚀", "🥷", "🧝", "🦹"];
type Screen = "onboard" | "select" | "choose" | "learn" | "play" | "summary";

export default function Academy({ catalog }: { catalog: Catalog }) {
  const s = useProgress();
  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<Screen>("select");
  const [subject, setSubject] = useState<SubjectId>("math");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [modeId, setModeId] = useState<string>("quiz");
  const [parentOpen, setParentOpen] = useState(false);
  const [summary, setSummary] = useState<GameSummary | null>(null);
  const playStart = useRef(0);

  useEffect(() => {
    setMounted(true);
    if (useProgress.getState().name === "Hero") setScreen("onboard");
    // Unlock audio on the very first user gesture (autoplay policy).
    const unlock = () => {
      audio.unlock();
      if (useProgress.getState().audioOn) audio.startMusic();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const isMs = s.locale === "ms";
  const subjectMeta = useMemo(() => catalog.subjects.find((x) => x.id === subject)!, [catalog.subjects, subject]);
  const topics: Topic[] = catalog.topicsByKey[`${s.year}:${subject}`] ?? [];
  const topic = topics.find((t) => t.id === topicId) ?? null;
  const click = () => audio.click();

  if (!mounted) {
    return (
      <div className="min-h-screen grid place-items-center text-2xl animate-floaty">🦧 KSSR Adventure Academy…</div>
    );
  }

  /* ---------- Onboarding ---------- */
  if (screen === "onboard") {
    return (
      <main className="min-h-screen grid place-items-center p-4">
        <div className="glass card p-6 sm:p-8 w-full max-w-md text-center animate-pop">
          <div className="text-7xl animate-floaty">🦧🎓</div>
          <h1 className="text-3xl font-black mt-3 text-shadow">KSSR Adventure Academy</h1>
          <p className="opacity-80 text-sm mb-5">{isMs ? "Belajar sambil bermain!" : "Learn while you play!"}</p>

          <p className="font-bold mb-2">{isMs ? "Pilih wira anda" : "Choose your hero"}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {AVATARS.map((a) => (
              <button
                key={a}
                className={`btn text-3xl w-14 h-14 rounded-2xl grid place-items-center transition ${
                  s.avatar === a ? "grad scale-110" : "bg-white/10"
                }`}
                onClick={() => {
                  click();
                  s.setProfile({ avatar: a });
                }}
              >
                {a}
              </button>
            ))}
          </div>

          <input
            className="w-full rounded-2xl px-4 py-3 bg-white/10 border-2 border-white/20 font-bold text-center mb-5 outline-none focus:border-cyan-400"
            placeholder={isMs ? "Nama anda" : "Your name"}
            maxLength={14}
            onChange={(e) => s.setProfile({ name: e.target.value || "Hero" })}
          />

          <p className="font-bold mb-2">{isMs ? "Pilih tahun (Darjah)" : "Choose your year (Darjah)"}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {catalog.years.map((y) => (
              <button
                key={y}
                className={`btn rounded-full px-4 py-2 font-bold ${s.year === y ? "grad" : "bg-white/10"}`}
                onClick={() => {
                  click();
                  s.setProfile({ year: y as Year });
                }}
              >
                {isMs ? "Tahun" : "Year"} {y}
              </button>
            ))}
          </div>

          <button
            className="btn grad rounded-2xl px-8 py-4 font-black text-lg w-full shine"
            onClick={() => {
              click();
              setScreen("select");
            }}
          >
            🚀 {isMs ? "Mula Pengembaraan" : "Start Adventure"}
          </button>
        </div>
      </main>
    );
  }

  /* ---------- Handlers ---------- */
  const startTopic = (t: Topic) => {
    click();
    setTopicId(t.id);
    setScreen("choose");
  };
  const beginPlay = () => {
    click();
    playStart.current = Date.now();
    setScreen("play");
  };
  const handleComplete = (sum: GameSummary) => {
    s.addTime(Math.round((Date.now() - playStart.current) / 1000));
    s.unlock("first-play");
    const level = sum.accuracy >= 0.9 ? "Gold" : sum.accuracy >= 0.7 ? "Silver" : "Bronze";
    s.grantCertificate(subject, s.year, level);
    if (subject === "math") s.unlock("math_hero");
    if (subject === "bm") s.unlock("bm_champion");
    if (subject === "english") s.unlock("english_master");
    setSummary(sum);
    setScreen("summary");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Hud onParent={() => { click(); setParentOpen(true); }} />

      {/* ---------- Topic selection ---------- */}
      {screen === "select" && (
        <section className="p-3 sm:p-5 max-w-3xl mx-auto w-full animate-slideUp">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="text-lg sm:text-2xl font-black text-shadow">
              {isMs ? "Pilih pengembaraan" : "Pick your adventure"}
            </h2>
            <select
              className="glass rounded-xl px-3 py-2 bg-transparent font-bold text-sm"
              value={s.year}
              onChange={(e) => s.setProfile({ year: Number(e.target.value) as Year })}
            >
              {catalog.years.map((y) => (
                <option key={y} value={y} className="text-black">
                  {isMs ? "Tahun" : "Year"} {y}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            {catalog.subjects.map((subj) => (
              <button
                key={subj.id}
                className="btn card rounded-2xl px-2 py-3 sm:py-4 font-bold text-sm sm:text-base flex flex-col items-center gap-1"
                style={{
                  background: subject === subj.id ? subj.color : "rgba(255,255,255,.07)",
                  boxShadow: subject === subj.id ? `0 8px 24px ${subj.color}66` : undefined,
                  border: "1px solid rgba(255,255,255,.12)",
                }}
                onClick={() => {
                  click();
                  setSubject(subj.id);
                }}
              >
                <span className="text-2xl sm:text-3xl">{subj.icon}</span>
                {subj.name[s.locale]}
              </button>
            ))}
          </div>

          {topics.length === 0 ? (
            <div className="glass card p-8 text-center opacity-80">
              {isMs
                ? `Kandungan Tahun ${s.year} ${subjectMeta.name.ms} akan datang. Cuba Tahun 1–3.`
                : `Year ${s.year} ${subjectMeta.name.en} content is coming soon. Try Years 1–3.`}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((t, i) => {
                const m = s.mastery[t.id] ?? 0;
                return (
                  <button
                    key={t.id}
                    className="btn glass card p-4 text-left animate-slideUp"
                    style={{ borderLeft: `6px solid ${subjectMeta.color}`, animationDelay: `${i * 60}ms` }}
                    onClick={() => startTopic(t)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-black truncate">{t.icon} {t.title[s.locale]}</div>
                        <div className="text-xs opacity-70 line-clamp-2">{t.description[s.locale]}</div>
                      </div>
                      <div className="text-right text-xs opacity-80 shrink-0">
                        <div className="text-lg font-black" style={{ color: subjectMeta.color }}>
                          {Math.round(m * 100)}%
                        </div>
                        {t.challenges.length} ⚡
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/40 overflow-hidden mt-2">
                      <div className="h-full rounded-full" style={{ width: `${m * 100}%`, background: subjectMeta.color }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ---------- Choose game mode ---------- */}
      {screen === "choose" && topic && (
        <GameSelect
          topic={topic}
          locale={s.locale}
          accent={subjectMeta.color}
          onLearn={() => { click(); setScreen("learn"); }}
          onPickMode={(id) => {
            click();
            setModeId(id);
            playStart.current = Date.now();
            setScreen("play");
          }}
          onBack={() => { click(); setScreen("select"); }}
        />
      )}

      {/* ---------- Learn ---------- */}
      {screen === "learn" && topic && (
        <section className="flex-1 flex flex-col">
          <button
            className="btn glass rounded-xl px-3 py-2 m-3 self-start text-sm font-bold"
            onClick={() => { click(); setScreen("choose"); }}
          >
            ← {isMs ? "Kembali" : "Back"}
          </button>
          <h2 className="text-center text-xl font-black text-shadow">{topic.icon} {topic.title[s.locale]}</h2>
          <p className="text-center text-xs opacity-70 mb-1">
            {isMs ? "Belajar dahulu, kemudian pilih permainan!" : "Learn first, then pick a game!"}
          </p>
          <LearnMode topic={topic} locale={s.locale} onStart={() => { click(); setScreen("choose"); }} />
        </section>
      )}

      {/* ---------- Play (selected mode) ---------- */}
      {screen === "play" && topic && (() => {
        const mode = getMode(modeId);
        if (!mode) return null;
        const Mode = mode.Component;
        return (
          <section className="p-3 max-w-2xl mx-auto w-full">
            <Mode
              key={`${topic.id}-${modeId}`}
              topic={topic}
              locale={s.locale}
              accent={subjectMeta.color}
              initialMastery={s.mastery[topic.id] ?? 0}
              onAnswer={(_c, correct) => s.recordAnswer(subject, topic.id, correct)}
              onReward={(r) => s.addReward(r)}
              onComplete={handleComplete}
              onBack={() => { click(); setScreen("choose"); }}
            />
          </section>
        );
      })()}

      {/* ---------- Summary ---------- */}
      {screen === "summary" && summary && topic && (
        <section className="flex-1 grid place-items-center p-4">
          <div className="glass card p-6 sm:p-8 text-center max-w-md w-full animate-pop">
            <div className="text-7xl animate-floaty">🏆</div>
            <h2 className="text-3xl font-black mt-2 text-shadow">{isMs ? "Tahniah!" : "Well done!"}</h2>
            <p className="opacity-80">{topic.title[s.locale]}</p>
            <div className="grid grid-cols-2 gap-3 my-5">
              <div className="glass rounded-2xl p-3">
                <div className="text-3xl font-black text-cyan-300">{Math.round(summary.accuracy * 100)}%</div>
                <div className="text-xs opacity-70">{isMs ? "Ketepatan" : "Accuracy"}</div>
              </div>
              <div className="glass rounded-2xl p-3">
                <div className="text-3xl font-black text-yellow-300">⭐ {summary.correct}</div>
                <div className="text-xs opacity-70">{isMs ? "Pintu dilepasi" : "Gates cleared"}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn grad rounded-2xl px-5 py-3 font-black flex-1" onClick={beginPlay}>
                🔁 {isMs ? "Main Lagi" : "Play Again"}
              </button>
              <button
                className="btn glass rounded-2xl px-5 py-3 font-black flex-1"
                onClick={() => { click(); setScreen("choose"); }}
              >
                🎮 {isMs ? "Permainan Lain" : "Other Games"}
              </button>
            </div>
            <button
              className="btn glass rounded-2xl px-5 py-3 font-bold w-full mt-2 text-sm"
              onClick={() => { click(); setScreen("select"); }}
            >
              🗺️ {isMs ? "Pilih Topik Lain" : "Choose Another Topic"}
            </button>
          </div>
        </section>
      )}

      {parentOpen && <ParentDashboard onClose={() => { click(); setParentOpen(false); }} />}
    </main>
  );
}
