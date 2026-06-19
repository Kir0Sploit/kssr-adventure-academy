"use client";
import { useProgress } from "@/lib/store";
import { SUBJECTS } from "@kssr/shared";
import type { SubjectId } from "@kssr/shared";

export default function ParentDashboard({ onClose, plan = "free" }: { onClose: () => void; plan?: string }) {
  const s = useProgress();
  const acc = (st: { attempts: number; correct: number }) => (st.attempts ? Math.round((st.correct / st.attempts) * 100) : 0);
  const stats = Object.values(s.stats) as { attempts: number; correct: number }[];
  const totalAttempts = stats.reduce((a, b) => a + b.attempts, 0);
  const totalCorrect = stats.reduce((a, b) => a + b.correct, 0);
  const overall = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const mins = Math.floor(s.timePlayedSec / 60);
  const isMs = s.locale === "ms";

  const BADGES: Record<string, { en: string; ms: string; icon: string }> = {
    "first-play": { en: "First Game", ms: "Main Pertama", icon: "🎮" },
    math_hero: { en: "Math Hero", ms: "Wira Matematik", icon: "🔢" },
    bm_champion: { en: "BM Champion", ms: "Juara BM", icon: "📘" },
    english_master: { en: "English Master", ms: "Penguasa English", icon: "📗" },
  };

  const printCert = (subject: SubjectId, year: number, level: string, date: string) => {
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) return;
    const subjName = SUBJECTS.find((x) => x.id === subject)?.name[s.locale] ?? subject;
    w.document.write(`<html><head><title>Certificate</title><style>
      body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fef6e4}
      .c{background:#fffef8;color:#1e293b;border:14px solid #d4af37;border-radius:14px;padding:40px;text-align:center;max-width:700px}
      h1{color:#7c3aed;margin:6px 0} .n{font-size:30px;font-weight:900;border-bottom:2px dashed #d4af37;display:inline-block;padding:0 20px}
    </style></head><body><div class="c">
      <div style="letter-spacing:3px;color:#d4af37">KSSR ADVENTURE ACADEMY</div>
      <h1>Certificate of Achievement</h1>
      <p>This certifies that</p><div class="n">${s.name}</div>
      <p>has demonstrated ${level} mastery in</p>
      <h2 style="color:#2563eb">${subjName} — Year ${year}</h2>
      <div style="font-size:34px">🏆 🌟 🎖️</div>
      <p>Date: ${date}</p></div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-violet-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-5 w-full max-w-2xl max-h-[92vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-violet-700">📊 {isMs ? "Papan Ibu Bapa" : "Parent Dashboard"}</h2>
          <button className="btn !min-h-0 rounded-2xl w-11 h-11" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            ["⏱️", isMs ? "Masa" : "Time", `${mins}m`, "#3b82f6"],
            ["🎯", isMs ? "Ketepatan" : "Accuracy", `${overall}%`, "#22c55e"],
            ["🔥", isMs ? "Streak" : "Streak", `${s.streak}`, "#f97316"],
            ["🏅", isMs ? "Lencana" : "Badges", `${s.achievements.length}`, "#f59e0b"],
          ].map(([icon, label, val, c]) => (
            <div key={label} className="panel rounded-2xl p-3 text-center">
              <div className="text-2xl">{icon}</div>
              <div className="font-display text-2xl" style={{ color: c }}>{val}</div>
              <div className="text-xs text-soft">{label}</div>
            </div>
          ))}
        </div>

        <div className="panel rounded-2xl p-4 mb-4">
          <h3 className="font-display mb-2">🏅 {isMs ? "Lencana Diperoleh" : "Badges Earned"}</h3>
          {s.achievements.length === 0 ? (
            <p className="text-sm text-soft">{isMs ? "Main untuk membuka lencana!" : "Play to unlock badges!"}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {s.achievements.map((id) => {
                const b = BADGES[id];
                return (
                  <span key={id} className="chip px-3 py-2 text-sm flex items-center gap-1">
                    <span className="text-lg">{b?.icon ?? "🏆"}</span>
                    {b ? b[s.locale] : id}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="panel rounded-2xl p-4 mb-4">
          <h3 className="font-display mb-2">{isMs ? "Kemajuan Mengikut Subjek" : "Progress by Subject"}</h3>
          {SUBJECTS.map((subj) => {
            const st = s.stats[subj.id] ?? { attempts: 0, correct: 0 };
            const a = acc(st);
            return (
              <div key={subj.id} className="mb-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{subj.icon} {subj.name[s.locale]}</span>
                  <span className="text-soft">{a}% ({st.correct}/{st.attempts})</span>
                </div>
                <div className="h-2.5 rounded-full bg-black/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${a}%`, background: subj.color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel rounded-2xl p-4">
          <h3 className="font-display mb-2">🎓 {isMs ? "Sijil" : "Certificates"}</h3>
          {plan !== "bundle" ? (
            <p className="text-sm text-soft">🔒 {isMs ? "Sijil tersedia dalam Pakej Lengkap. Naik taraf untuk membuka." : "Certificates are part of the Complete Bundle. Upgrade to unlock."}</p>
          ) : s.certificates.length === 0 ? (
            <p className="text-sm text-soft">{isMs ? "Selesaikan permainan untuk memperoleh sijil." : "Finish a game to earn certificates."}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {s.certificates.map((c) => (
                <button
                  key={c.id}
                  className="btn !min-h-0 btn-primary rounded-full px-4 py-2 text-sm font-display"
                  onClick={() => printCert(c.subject, c.year, c.level, c.date)}
                >
                  📜 {SUBJECTS.find((x) => x.id === c.subject)?.name[s.locale]} Y{c.year} · {c.level}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
