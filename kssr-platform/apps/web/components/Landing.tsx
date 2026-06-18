"use client";
import { useProgress } from "@/lib/store";
import { audio } from "@/lib/audio";
import { GAME_MODES } from "@/lib/games";
import { SUBJECTS, YEARS } from "@kssr/shared";
import { getTopicMetas, TOPIC_COUNT } from "@kssr/curriculum";

function subjectTopicCount(subject: string): number {
  let n = 0;
  for (const y of YEARS) n += getTopicMetas(y, subject as never).length;
  return n;
}

/** Marketing-style landing page (the app lives behind "Main Sekarang"). */
export default function Landing({ onStart }: { onStart: () => void }) {
  const s = useProgress();
  const isMs = s.locale === "ms";
  const go = () => { audio.unlock(); audio.click(); if (s.audioOn) audio.startMusic(); onStart(); };

  const chips = isMs
    ? ["✅ Percuma", "🚫 Tanpa iklan", "🎓 KSSR Darjah 1–6", "📲 Boleh offline", "🔒 Selamat untuk anak"]
    : ["✅ Free", "🚫 No ads", "🎓 KSSR Years 1–6", "📲 Works offline", "🔒 Kid-safe"];

  const stats = [
    { v: `${TOPIC_COUNT}+`, l: isMs ? "Topik" : "Topics" },
    { v: "∞", l: isMs ? "Soalan" : "Questions" },
    { v: `${GAME_MODES.length}`, l: isMs ? "Cara Main" : "Game Modes" },
    { v: "3", l: isMs ? "Subjek" : "Subjects" },
  ];

  const features = isMs
    ? [
        { i: "🎮", t: "Belajar Sambil Main", d: "Soalan pendek, warna ceria & ganjaran segera buat anak terus fokus." },
        { i: "🗣️", t: "Suara BM & English", d: "Soalan dibaca kuat — sesuai untuk anak yang baru belajar membaca." },
        { i: "📊", t: "Dashboard Ibu Bapa", d: "Pantau ketepatan, masa main & topik yang anak perlu lebih latihan." },
        { i: "🏆", t: "Bintang & Lencana", d: "Kumpul bintang, naik pangkat & kekalkan streak harian 🔥." },
      ]
    : [
        { i: "🎮", t: "Learn While Playing", d: "Short questions, cheerful colours and instant rewards keep kids focused." },
        { i: "🗣️", t: "Malay & English Voice", d: "Questions read aloud — great for early readers." },
        { i: "📊", t: "Parent Dashboard", d: "Track accuracy, time played and topics that need more practice." },
        { i: "🏆", t: "Stars & Badges", d: "Collect stars, rank up and keep a daily 🔥 streak." },
      ];

  const steps = isMs
    ? [
        { i: "🦸", t: "Pilih Wira", d: "Pilih avatar, nama & tahun anak." },
        { i: "📚", t: "Pilih Subjek & Topik", d: "Matematik, Bahasa Melayu atau English." },
        { i: "🎮", t: "Main & Belajar", d: "Pilih permainan dan kumpul bintang!" },
      ]
    : [
        { i: "🦸", t: "Pick a Hero", d: "Choose an avatar, name & year." },
        { i: "📚", t: "Pick Subject & Topic", d: "Maths, Bahasa Melayu or English." },
        { i: "🎮", t: "Play & Learn", d: "Choose a game and collect stars!" },
      ];

  const mascots = [
    { e: "🦧", n: "Oren" }, { e: "🦉", n: "Nova" }, { e: "🐯", n: "Captain" }, { e: "🦜", n: "Pak Mat" },
  ];

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 px-3 py-2">
        <div className="panel rounded-3xl flex items-center gap-2 p-2">
          <span className="text-2xl animate-wiggle">🦧</span>
          <span className="font-display text-lg text-violet-700 leading-none">KSSR Adventure<br className="hidden sm:block" /> Academy</span>
          <button
            className="btn !min-h-0 rounded-2xl px-3 py-2 btn-sky ml-auto"
            onClick={() => s.setLocale(isMs ? "en" : "ms")}
          >
            {isMs ? "EN" : "BM"}
          </button>
          <button className="btn !min-h-0 rounded-2xl px-4 py-2 btn-primary font-display" onClick={go}>
            {isMs ? "Main" : "Play"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-4 pb-2 max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        <div className="animate-slideUp">
          <span className="chip inline-block px-3 py-1.5 text-sm">🇲🇾 {isMs ? "Untuk Anak Malaysia" : "For Malaysian Kids"}</span>
          <h1 className="font-display text-4xl sm:text-5xl text-violet-700 mt-3 leading-tight">
            {isMs ? "Anak belajar sambil main game" : "Kids learn while playing games"}
          </h1>
          <p className="text-soft text-lg mt-3">
            {isMs
              ? "Matematik, Bahasa Melayu & English — ikut KSSR Darjah 1 hingga 6. Soalan tanpa had, suara & ganjaran ceria."
              : "Maths, Bahasa Melayu & English — KSSR Years 1 to 6. Unlimited questions, voice and cheerful rewards."}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="btn btn-primary rounded-2xl px-7 py-4 font-display text-xl" onClick={go}>
              🎮 {isMs ? "Main Sekarang" : "Play Now"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {chips.map((c) => <span key={c} className="chip px-3 py-1.5 text-xs">{c}</span>)}
          </div>
        </div>

        {/* Phone mockup */}
        <div className="justify-self-center animate-pop">
          <div className="rounded-[2.2rem] p-3 bg-violet-900/15 border-4 border-white shadow-2xl w-[260px]">
            <div className="rounded-[1.6rem] overflow-hidden bg-white">
              <div className="grad text-white text-xs font-bold px-3 py-1.5 flex justify-between">
                <span>🦧 Academy</span><span>9:41 🔋</span>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-soft font-bold flex justify-between">
                  <span>Matematik</span><span>⭐ 3/8</span>
                </div>
                <div className="card p-3 mt-2 text-center">
                  <div className="font-display text-2xl text-violet-700">7 × 6 = ?</div>
                </div>
                <div className="grid gap-2 mt-2">
                  {["42", "36", "48"].map((o, i) => (
                    <div key={o} className="btn !min-h-0 rounded-xl py-2 font-display text-center" style={i === 0 ? { background: "#36b14f", color: "#fff", boxShadow: "0 4px 0 #1f8a3a" } : undefined}>
                      {o}
                    </div>
                  ))}
                </div>
                <div className="text-center font-display text-green-600 mt-2">Hebat! 🎉</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-4 my-4 max-w-3xl mx-auto">
        <div className="card grid grid-cols-4 divide-x divide-black/5 sticker">
          {stats.map((st) => (
            <div key={st.l} className="p-3 text-center">
              <div className="font-display text-2xl sm:text-3xl text-amber-500">{st.v}</div>
              <div className="text-[11px] sm:text-xs text-soft font-bold">{st.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-1">📚 {isMs ? "Subjek Sekolah" : "School Subjects"}</h2>
        <p className="text-center text-soft mb-4 text-sm">{isMs ? "Ikut silibus KSSR Darjah 1–6" : "Following KSSR Years 1–6"}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUBJECTS.map((subj) => (
            <div key={subj.id} className="card p-5 text-center" style={{ borderTop: `8px solid ${subj.color}` }}>
              <div className="text-5xl">{subj.icon}</div>
              <div className="font-display text-lg mt-2">{subj.name[s.locale]}</div>
              <div className="chip inline-block px-3 py-1 text-xs mt-2" style={{ color: subj.color }}>
                {subjectTopicCount(subj.id)} {isMs ? "topik" : "topics"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">✨ {isMs ? "Kenapa Anak Suka" : "Why Kids Love It"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={f.t} className={`card p-5 ${i % 2 ? "sticker-r" : "sticker"}`}>
              <div className="text-4xl">{f.i}</div>
              <div className="font-display text-lg mt-1 text-violet-700">{f.t}</div>
              <div className="text-soft text-sm mt-1">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Game modes */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">🎮 {isMs ? "Pelbagai Cara Main" : "Many Ways to Play"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GAME_MODES.map((m) => (
            <div key={m.id} className="card p-4 text-center" style={{ borderTop: `8px solid ${m.color}` }}>
              <div className="text-4xl">{m.icon}</div>
              <div className="font-display mt-1">{m.name[s.locale]}</div>
              <div className="text-[11px] text-soft">{m.desc[s.locale]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How to */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">🚀 {isMs ? "Mula Dalam 3 Langkah" : "Start in 3 Steps"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map((st, i) => (
            <div key={st.t} className="card p-5 text-center relative">
              <div className="absolute -top-3 -left-2 chip w-9 h-9 grid place-items-center font-display text-violet-700">{i + 1}</div>
              <div className="text-4xl animate-bobble">{st.i}</div>
              <div className="font-display text-lg mt-1">{st.t}</div>
              <div className="text-soft text-sm mt-1">{st.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mascots */}
      <section className="px-4 py-4 max-w-3xl mx-auto text-center">
        <h2 className="font-display text-2xl text-violet-700 mb-4">🤗 {isMs ? "Kenali Rakan Belajar" : "Meet Your Learning Buddies"}</h2>
        <div className="flex justify-center flex-wrap gap-4">
          {mascots.map((m) => (
            <div key={m.n} className="card p-4 w-28">
              <div className="text-5xl animate-bobble">{m.e}</div>
              <div className="font-display mt-1">{m.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-6 max-w-2xl mx-auto text-center">
        <div className="card p-6 grad text-white">
          <div className="text-5xl animate-bobble">🎉</div>
          <h2 className="font-display text-2xl mt-2">{isMs ? "Jom mula belajar — percuma!" : "Start learning — for free!"}</h2>
          <button className="btn rounded-2xl px-8 py-4 font-display text-xl mt-3 text-violet-700" onClick={go}>
            🎮 {isMs ? "Main Sekarang" : "Play Now"}
          </button>
        </div>
      </section>

      <footer className="text-center text-soft text-xs py-6 px-4">
        {isMs ? "Dibina dengan ❤️ untuk anak Malaysia • KSSR Darjah 1–6" : "Built with ❤️ for Malaysian kids • KSSR Years 1–6"}
      </footer>
    </main>
  );
}
