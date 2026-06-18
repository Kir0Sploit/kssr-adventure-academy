"use client";
import { useProgress } from "@/lib/store";
import { SUBJECTS } from "@kssr/shared";
import type { SubjectId } from "@kssr/shared";

export default function ParentDashboard({ onClose }: { onClose: () => void }) {
  const s = useProgress();
  const acc = (st: { attempts: number; correct: number }) =>
    st.attempts ? Math.round((st.correct / st.attempts) * 100) : 0;
  const totalAttempts = (Object.values(s.stats) as { attempts: number; correct: number }[]).reduce(
    (a, b) => a + b.attempts,
    0,
  );
  const totalCorrect = (Object.values(s.stats) as { attempts: number; correct: number }[]).reduce(
    (a, b) => a + b.correct,
    0,
  );
  const overall = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const mins = Math.floor(s.timePlayedSec / 60);
  const mastered = Object.values(s.mastery).filter((m) => m >= 0.7).length;
  const isMs = s.locale === "ms";

  const printCert = (subject: SubjectId, year: number, level: string, date: string) => {
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) return;
    const subjName = SUBJECTS.find((x) => x.id === subject)?.name[s.locale] ?? subject;
    w.document.write(`<html><head><title>Certificate</title><style>
      body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#eee}
      .c{background:#fffef8;color:#1e293b;border:14px solid #d4af37;border-radius:8px;padding:40px;text-align:center;max-width:700px}
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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-5 w-full max-w-2xl max-h-[92vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">📊 {isMs ? "Papan Ibu Bapa" : "Parent Dashboard"}</h2>
          <button className="btn glass rounded-xl w-10 h-10" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            ["⏱️", isMs ? "Masa" : "Time", `${mins}m`],
            ["🎯", isMs ? "Ketepatan" : "Accuracy", `${overall}%`],
            ["🧠", isMs ? "Dikuasai" : "Mastered", `${mastered}`],
            ["🏅", isMs ? "Lencana" : "Badges", `${s.achievements.length}`],
          ].map(([icon, label, val]) => (
            <div key={label} className="glass rounded-2xl p-3 text-center">
              <div className="text-2xl">{icon}</div>
              <div className="text-2xl font-black">{val}</div>
              <div className="text-xs opacity-70">{label}</div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 mb-4">
          <h3 className="font-bold mb-2">{isMs ? "Kemajuan Mengikut Subjek" : "Progress by Subject"}</h3>
          {SUBJECTS.map((subj) => {
            const st = s.stats[subj.id];
            const a = acc(st);
            return (
              <div key={subj.id} className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{subj.icon} {subj.name[s.locale]}</span>
                  <span>{a}% ({st.correct}/{st.attempts})</span>
                </div>
                <div className="h-2 rounded bg-black/40 overflow-hidden">
                  <div className="h-full" style={{ width: `${a}%`, background: subj.color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass rounded-2xl p-4">
          <h3 className="font-bold mb-2">🎓 {isMs ? "Sijil" : "Certificates"}</h3>
          {s.certificates.length === 0 ? (
            <p className="text-sm opacity-60">{isMs ? "Selesaikan topik untuk memperoleh sijil." : "Complete topics to earn certificates."}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {s.certificates.map((c) => (
                <button
                  key={c.id}
                  className="btn grad rounded-full px-4 py-2 text-sm font-bold"
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
