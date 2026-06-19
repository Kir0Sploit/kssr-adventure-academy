"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Catalog } from "@/lib/catalog";
import { useProgress } from "@/lib/store";
import { audio } from "@/lib/audio";
import { confetti } from "@/lib/confetti";
import { pushSocialEvent, recordPlayEvent, setSocialEndpoint } from "@/lib/socialProof";
import type { SubjectId, Topic, Year } from "@kssr/shared";
import Hud from "./Hud";
import Landing from "./Landing";
import LearnMode from "./LearnMode";
import GameSelect from "./GameSelect";
import ParentDashboard from "./ParentDashboard";
import SocialProofToaster from "./SocialProofToaster";
import ParentAuth from "./ParentAuth";
import ProfileSelect from "./ProfileSelect";
import { getMode } from "@/lib/games";
import type { GameSummary } from "@/lib/gameUtils";
import { setCustomChallenges } from "@/lib/gameUtils";
import { getMe, logout as apiLogout, saveChildProgress, type AccountDTO, type ChildDTO } from "@/lib/account";

const AVATARS = ["🦸", "🦸‍♀️", "🧒", "👧", "🧑‍🚀", "🥷", "🧝", "🦹"];
type Screen = "home" | "auth" | "profiles" | "onboard" | "select" | "choose" | "learn" | "play" | "summary";

function Mascot({ size = 84 }: { size?: number }) {
  return (
    <span className="inline-block animate-bobble" style={{ fontSize: size, lineHeight: 1 }}>
      🦧
    </span>
  );
}

export default function Academy({ catalog }: { catalog: Catalog }) {
  const s = useProgress();
  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [subject, setSubject] = useState<SubjectId>("math");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [modeId, setModeId] = useState<string>("quiz");
  const [parentOpen, setParentOpen] = useState(false);
  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [account, setAccount] = useState<AccountDTO | null>(null);
  const [children, setChildren] = useState<ChildDTO[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const playStart = useRef(0);

  useEffect(() => {
    setMounted(true);
    setSocialEndpoint("/api/social-proof");
    // Load admin-authored (CMS) questions to merge into games.
    fetch("/api/challenges").then((r) => r.json()).then((d) => { if (Array.isArray(d.items)) setCustomChallenges(d.items); }).catch(() => {});
    // Restore any existing parent session (does not force login — guest play stays).
    void getMe().then((me) => {
      if (me.account) {
        setAccount(me.account);
        setChildren(me.children ?? []);
      }
    });
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
    return <div className="min-h-screen grid place-items-center text-2xl font-display animate-bobble">🦧 …</div>;
  }

  /* ---------- Landing ---------- */
  // Security: playing requires a logged-in parent + a selected child profile.
  const enterApp = () => setScreen(account ? "profiles" : "auth");
  if (screen === "home") {
    return <Landing onStart={enterApp} onParent={enterApp} />;
  }

  /* ---------- Parent auth ---------- */
  if (screen === "auth") {
    return (
      <ParentAuth
        onAuthed={(acc, kids) => { setAccount(acc); setChildren(kids); setScreen("profiles"); }}
        onBack={() => setScreen("home")}
      />
    );
  }

  /* ---------- Child profile select ---------- */
  if (screen === "profiles" && account) {
    return (
      <ProfileSelect
        accountName={account.name}
        plan={account.plan}
        children={children}
        onSelect={(child) => {
          try {
            const snap = JSON.parse(child.progress || "{}");
            useProgress.getState().importProgress(snap);
          } catch { /* ignore bad json */ }
          s.setProfile({ name: child.name, avatar: child.avatar, year: child.year as Year });
          setActiveChildId(child.id);
          setScreen("select");
        }}
        onChildAdded={(child) => setChildren((c) => [...c, child])}
        onUpgraded={() => setAccount((a) => (a ? { ...a, plan: "bundle" } : a))}
        onLogout={async () => { await apiLogout(); setAccount(null); setChildren([]); setActiveChildId(null); setScreen("home"); }}
      />
    );
  }

  /* ---------- Guard: in-app screens require auth + a selected child ---------- */
  if (!account || !activeChildId) {
    return <Landing onStart={enterApp} onParent={enterApp} />;
  }

  const startTopic = (t: Topic) => { click(); setTopicId(t.id); setScreen("choose"); };
  const beginPlay = () => { click(); playStart.current = Date.now(); setScreen("play"); };
  const handleComplete = (sum: GameSummary) => {
    s.addTime(Math.round((Date.now() - playStart.current) / 1000));
    const before = useProgress.getState().achievements.slice();
    s.unlock("first-play");
    s.touchStreak();
    const level = sum.accuracy >= 0.9 ? "Gold" : sum.accuracy >= 0.7 ? "Silver" : "Bronze";
    s.grantCertificate(subject, s.year, level);
    if (subject === "math") s.unlock("math_hero");
    if (subject === "bm") s.unlock("bm_champion");
    if (subject === "english") s.unlock("english_master");
    audio.victory();
    confetti(40);
    // Persist a real, anonymous play event (powers honest analytics).
    if (topic) recordPlayEvent({ subject, topicId: topic.id, year: s.year, correct: sum.correct, total: sum.answered });
    // Real, player-driven social-proof events (self-progress — never fabricated).
    if (topic) {
      pushSocialEvent({ text: isMs ? `Anda menamatkan ${topic.title.ms}! ⭐` : `You finished ${topic.title.en}! ⭐`, icon: "🎮" });
    }
    const after = useProgress.getState().achievements;
    const badgeLabel: Record<string, { en: string; ms: string }> = {
      math_hero: { en: "Math Hero badge", ms: "Lencana Wira Matematik" },
      bm_champion: { en: "BM Champion badge", ms: "Lencana Juara BM" },
      english_master: { en: "English Master badge", ms: "Lencana Penguasa English" },
      "first-play": { en: "First Game badge", ms: "Lencana Main Pertama" },
    };
    after
      .filter((a) => !before.includes(a))
      .forEach((a) => {
        const lbl = badgeLabel[a];
        if (lbl) pushSocialEvent({ text: isMs ? `Anda membuka ${lbl.ms}!` : `You unlocked the ${lbl.en}!`, icon: "🏅" });
      });
    setSummary(sum);
    setScreen("summary");
    // Sync to the child's cloud profile when logged in.
    if (activeChildId) {
      saveChildProgress(activeChildId, useProgress.getState().exportProgress(), useProgress.getState().year);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Hud onParent={() => { click(); setParentOpen(true); }} onHome={() => { click(); setScreen("home"); }} />

      {/* ---------- Topic selection ---------- */}
      {screen === "select" && (
        <section className="p-3 sm:p-5 max-w-3xl mx-auto w-full animate-slideUp">
          <div className="card p-4 mb-4 flex items-center gap-3 sticker">
            <Mascot size={56} />
            <div className="flex-1">
              <p className="font-display text-lg text-violet-700 leading-tight">
                {isMs ? `Hai ${s.name}! Apa kita belajar hari ini?` : `Hi ${s.name}! What shall we learn today?`}
              </p>
            </div>
            <select
              className="chip px-3 py-2 font-display text-sm text-violet-700 outline-none"
              value={s.year}
              onChange={(e) => s.setProfile({ year: Number(e.target.value) as Year })}
            >
              {catalog.years.map((y) => (
                <option key={y} value={y}>{isMs ? "Tahun" : "Year"} {y}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            {catalog.subjects.map((subj) => (
              <button
                key={subj.id}
                className="btn rounded-3xl px-2 py-3 sm:py-4 flex flex-col items-center gap-1"
                style={
                  subject === subj.id
                    ? { background: subj.color, color: "#fff", boxShadow: `0 6px 0 ${subj.color}99` }
                    : undefined
                }
                onClick={() => { click(); setSubject(subj.id); }}
              >
                <span className="text-3xl sm:text-4xl">{subj.icon}</span>
                <span className="font-display text-sm sm:text-base">{subj.name[s.locale]}</span>
              </button>
            ))}
          </div>

          {topics.length === 0 ? (
            <div className="card p-8 text-center text-soft">
              {isMs
                ? `Topik Tahun ${s.year} ${subjectMeta.name.ms} akan datang. Cuba Tahun 1–3 dahulu!`
                : `Year ${s.year} ${subjectMeta.name.en} topics are coming soon. Try Years 1–3!`}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((t, i) => {
                const m = s.mastery[t.id] ?? 0;
                return (
                  <button
                    key={t.id}
                    className={`btn card p-4 text-left animate-slideUp ${i % 2 ? "sticker-r" : "sticker"}`}
                    style={{ borderTop: `8px solid ${subjectMeta.color}`, animationDelay: `${i * 60}ms` }}
                    onClick={() => startTopic(t)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-display text-lg truncate">{t.icon} {t.title[s.locale]}</div>
                        <div className="text-xs text-soft line-clamp-2">{t.description[s.locale]}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-xl" style={{ color: subjectMeta.color }}>{Math.round(m * 100)}%</div>
                        <div className="text-xs text-soft">{t.challenges.length} ⚡</div>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-black/10 overflow-hidden mt-2">
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
          onPickMode={(id) => { click(); setModeId(id); playStart.current = Date.now(); setScreen("play"); }}
          onBack={() => { click(); setScreen("select"); }}
        />
      )}

      {/* ---------- Learn ---------- */}
      {screen === "learn" && topic && (
        <section className="flex-1 flex flex-col">
          <button className="btn !min-h-0 rounded-2xl px-4 py-2 m-3 self-start" onClick={() => { click(); setScreen("choose"); }}>
            ← {isMs ? "Kembali" : "Back"}
          </button>
          <h2 className="text-center font-display text-2xl text-violet-700">{topic.icon} {topic.title[s.locale]}</h2>
          <p className="text-center text-sm text-soft mb-1">{isMs ? "Belajar dahulu, kemudian pilih permainan!" : "Learn first, then pick a game!"}</p>
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
              rounds={account?.plan === "bundle" ? undefined : 5}
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
          <div className="card p-6 sm:p-8 text-center max-w-md w-full animate-pop">
            <div className="text-7xl animate-bobble">🏆</div>
            <h2 className="font-display text-3xl mt-2 text-violet-700">{isMs ? "Tahniah!" : "Well done!"}</h2>
            <p className="text-soft">{topic.title[s.locale]}</p>
            <div className="grid grid-cols-2 gap-3 my-5">
              <div className="panel rounded-2xl p-3">
                <div className="font-display text-3xl text-sky-600">{Math.round(summary.accuracy * 100)}%</div>
                <div className="text-xs text-soft">{isMs ? "Ketepatan" : "Accuracy"}</div>
              </div>
              <div className="panel rounded-2xl p-3">
                <div className="font-display text-3xl text-amber-500">⭐ {summary.correct}</div>
                <div className="text-xs text-soft">{isMs ? "Markah" : "Score"}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-go rounded-2xl px-5 py-3 font-display flex-1" onClick={beginPlay}>
                🔁 {isMs ? "Main Lagi" : "Play Again"}
              </button>
              <button className="btn rounded-2xl px-5 py-3 font-display flex-1" onClick={() => { click(); setScreen("choose"); }}>
                🎮 {isMs ? "Permainan Lain" : "Other Games"}
              </button>
            </div>
            <button className="btn rounded-2xl px-5 py-2 w-full mt-2 text-sm" onClick={() => { click(); setScreen("select"); }}>
              🗺️ {isMs ? "Pilih Topik Lain" : "Choose Another Topic"}
            </button>
          </div>
        </section>
      )}

      {parentOpen && <ParentDashboard onClose={() => { click(); setParentOpen(false); }} plan={account?.plan ?? "free"} />}
      <SocialProofToaster />
    </main>
  );
}
