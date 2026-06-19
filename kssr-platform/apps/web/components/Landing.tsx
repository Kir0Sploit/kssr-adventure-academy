"use client";
import { useState } from "react";
import { useProgress } from "@/lib/store";
import { audio } from "@/lib/audio";
import { GAME_MODES } from "@/lib/games";
import SocialProofToaster from "./SocialProofToaster";
import { SUBJECTS, YEARS } from "@kssr/shared";
import { getTopicMetas, TOPIC_COUNT } from "@kssr/curriculum";

function subjectTopicCount(subject: string): number {
  let n = 0;
  for (const y of YEARS) n += getTopicMetas(y, subject as never).length;
  return n;
}

/** Real, consented reviews go here (replace with verified parent feedback). */
interface Review { name: string; place: string; text: string; avatar: string }
const REVIEWS: Review[] = [];

function EmailCapture({ isMs }: { isMs: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    audio.click();
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });
      const j = await r.json();
      setState(j.ok ? "ok" : "err");
    } catch {
      setState("err");
    }
    setBusy(false);
  };

  if (state === "ok") {
    return <div className="card p-5 text-center font-display text-green-600">🎉 {isMs ? "Terima kasih! Kami akan e-mel anda." : "Thanks! We'll email you."}</div>;
  }
  return (
    <div className="card p-5">
      <div className="font-display text-lg text-violet-700">📩 {isMs ? "Nak tahu bila ada permainan baharu?" : "Want news on new games?"}</div>
      <p className="text-soft text-sm mb-3">{isMs ? "Tinggalkan e-mel — kami maklumkan kemas kini & promosi." : "Leave your email — we'll share updates & offers."}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input className="flex-1 rounded-2xl px-4 py-3 bg-amber-50 border-[3px] border-amber-200 font-bold text-violet-800 outline-none focus:border-amber-400"
          type="email" placeholder="E-mel anda" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-primary rounded-2xl px-6 py-3 font-display" disabled={busy || !consent} onClick={submit}>
          {isMs ? "Daftar" : "Subscribe"}
        </button>
      </div>
      <label className="flex items-center gap-2 mt-2 text-xs text-soft cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-4 h-4" />
        {isMs ? "Saya bersetuju menerima e-mel (PDPA). Boleh berhenti bila-bila masa." : "I agree to receive emails (PDPA). Unsubscribe anytime."}
      </label>
      {state === "err" && <div className="text-red-500 text-sm mt-1">{isMs ? "Ralat. Cuba lagi." : "Error. Try again."}</div>}
    </div>
  );
}

export default function Landing({ onStart, onParent }: { onStart: () => void; onParent: () => void }) {
  const s = useProgress();
  const isMs = s.locale === "ms";
  const go = () => { audio.unlock(); audio.click(); if (s.audioOn) audio.startMusic(); onStart(); };
  const parent = () => { audio.click(); onParent(); };

  const chips = isMs
    ? ["✅ Percuma", "🚫 Tanpa iklan", "🎓 KSSR Darjah 1–6", "📲 Boleh offline", "🔒 Selamat"]
    : ["✅ Free", "🚫 No ads", "🎓 KSSR Years 1–6", "📲 Offline", "🔒 Kid-safe"];

  const stats = [
    { v: `${TOPIC_COUNT}+`, l: isMs ? "Topik" : "Topics" },
    { v: "∞", l: isMs ? "Soalan" : "Questions" },
    { v: `${GAME_MODES.length}`, l: isMs ? "Cara Main" : "Game Modes" },
    { v: "3", l: isMs ? "Subjek" : "Subjects" },
  ];

  const pains = isMs
    ? [
        { i: "😤", t: "“Anak main game je, tak nak belajar.”", d: "Tukar masa skrin jadi masa belajar yang anak suka." },
        { i: "💸", t: "“Tuisyen mahal, hasil sama je.”", d: "Latihan harian percuma yang ikut silibus KSSR." },
        { i: "😪", t: "“Saya penat, tak sempat ajar.”", d: "5–10 minit sehari, anak boleh main sendiri." },
      ]
    : [
        { i: "😤", t: "“My child only plays games, won't study.”", d: "Turn screen time into learning time kids enjoy." },
        { i: "💸", t: "“Tuition is costly, same results.”", d: "Free daily practice aligned to KSSR." },
        { i: "😪", t: "“I'm tired, no time to teach.”", d: "5–10 minutes a day; kids play on their own." },
      ];

  const features = isMs
    ? [
        { i: "🎮", t: "Belajar Sambil Main", d: "Soalan pendek, warna ceria & ganjaran segera." },
        { i: "🗣️", t: "Suara BM & English", d: "Soalan dibaca kuat untuk anak yang baru membaca." },
        { i: "📊", t: "Dashboard Ibu Bapa", d: "Pantau ketepatan, masa & topik perlu latihan." },
        { i: "🏆", t: "Bintang & Streak", d: "Kumpul bintang, lencana & streak harian 🔥." },
        { i: "🎓", t: "Ikut KSSR", d: "Matematik, Bahasa Melayu & English, Darjah 1–6." },
        { i: "📲", t: "Boleh Offline", d: "Main tanpa internet, di mana sahaja." },
      ]
    : [
        { i: "🎮", t: "Learn While Playing", d: "Short questions, cheerful colours, instant rewards." },
        { i: "🗣️", t: "Malay & English Voice", d: "Questions read aloud for early readers." },
        { i: "📊", t: "Parent Dashboard", d: "Track accuracy, time & topics needing practice." },
        { i: "🏆", t: "Stars & Streaks", d: "Collect stars, badges & a daily 🔥 streak." },
        { i: "🎓", t: "KSSR-aligned", d: "Maths, Bahasa Melayu & English, Years 1–6." },
        { i: "📲", t: "Works Offline", d: "Play with no internet, anywhere." },
      ];

  const steps = isMs
    ? [{ i: "🦸", t: "Pilih Wira" }, { i: "📚", t: "Pilih Subjek" }, { i: "🎮", t: "Main & Belajar" }]
    : [{ i: "🦸", t: "Pick a Hero" }, { i: "📚", t: "Pick a Subject" }, { i: "🎮", t: "Play & Learn" }];

  const faqs = isMs
    ? [
        ["Adakah ia percuma?", "Ya! Anda boleh main terus tanpa bayaran. Akaun ibu bapa juga percuma untuk simpan kemajuan."],
        ["Selamat untuk anak?", "Ya — tiada iklan, tiada pop-up jualan, tiada chat dengan orang asing."],
        ["Ikut silibus Malaysia?", "Ya, kandungan disusun mengikut KSSR Darjah 1–6."],
        ["Perlu internet?", "Tidak. Selepas dibuka, ia boleh dimainkan secara offline."],
      ]
    : [
        ["Is it free?", "Yes! Play instantly at no cost. Parent accounts are free too, to save progress."],
        ["Is it safe for kids?", "Yes — no ads, no sales pop-ups, no chatting with strangers."],
        ["Follows Malaysian syllabus?", "Yes, content follows KSSR Years 1–6."],
        ["Need internet?", "No. Once loaded, it plays offline."],
      ];

  const mock = (
    <div className="rounded-[2.2rem] p-3 bg-violet-900/15 border-4 border-white shadow-2xl w-[250px]">
      <div className="rounded-[1.6rem] overflow-hidden bg-white">
        <div className="grad text-white text-xs font-bold px-3 py-1.5 flex justify-between"><span>🦧 Academy</span><span>9:41 🔋</span></div>
        <div className="p-3">
          <div className="text-[11px] text-soft font-bold flex justify-between"><span>Matematik</span><span>⭐ 3/8</span></div>
          <div className="card p-3 mt-2 text-center"><div className="font-display text-2xl text-violet-700">7 × 6 = ?</div></div>
          <div className="grid gap-2 mt-2">
            {["42", "36", "48"].map((o, i) => (
              <div key={o} className="rounded-xl py-2 font-display text-center text-sm" style={i === 0 ? { background: "#36b14f", color: "#fff" } : { background: "#f1f0fb" }}>{o}</div>
            ))}
          </div>
          <div className="text-center font-display text-green-600 mt-2 text-sm">Hebat! 🎉</div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen pb-24 sm:pb-0">
      {/* Sticky nav */}
      <header className="sticky top-0 z-30 px-3 py-2">
        <div className="panel rounded-3xl flex items-center gap-2 p-2">
          <span className="text-2xl animate-wiggle">🦧</span>
          <span className="font-display text-base sm:text-lg text-violet-700 leading-none">KSSR Adventure<br className="hidden sm:block" /> Academy</span>
          <button className="btn !min-h-0 rounded-2xl px-3 py-2 btn-sky ml-auto" onClick={() => s.setLocale(isMs ? "en" : "ms")}>{isMs ? "EN" : "BM"}</button>
          <button className="btn !min-h-0 rounded-2xl px-3 py-2" onClick={parent} title={isMs ? "Akaun Ibu Bapa" : "Parent Account"}>👨‍👩‍👧</button>
          <button className="btn !min-h-0 rounded-2xl px-4 py-2 btn-primary font-display" onClick={go}>{isMs ? "Main" : "Play"}</button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-4 pb-2 max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        <div className="animate-slideUp">
          <span className="chip inline-block px-3 py-1.5 text-sm">🇲🇾 {isMs ? "Untuk Anak Malaysia" : "For Malaysian Kids"}</span>
          <h1 className="font-display text-4xl sm:text-5xl text-violet-700 mt-3 leading-tight">
            {isMs ? "Belajar Sambil Bermain dengan KSSR Adventure Academy!" : "Learn While Playing with KSSR Adventure Academy!"}
          </h1>
          <p className="text-soft text-lg mt-3">
            {isMs ? "Matematik, Bahasa Melayu & English — ikut KSSR Darjah 1–6. Soalan tanpa had, suara & ganjaran ceria. Percuma." : "Maths, Bahasa Melayu & English — KSSR Years 1–6. Unlimited questions, voice & cheerful rewards. Free."}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="btn btn-primary rounded-2xl px-7 py-4 font-display text-xl" onClick={go}>🎮 {isMs ? "Cuba Percuma" : "Try Free"}</button>
            <button className="btn btn-go rounded-2xl px-6 py-4 font-display text-xl" onClick={parent}>👨‍👩‍👧 {isMs ? "Daftar Ibu Bapa" : "Parent Sign-up"}</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">{chips.map((c) => <span key={c} className="chip px-3 py-1.5 text-xs">{c}</span>)}</div>
        </div>
        <div className="justify-self-center animate-pop">{mock}</div>
      </section>

      {/* Stats */}
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

      {/* Problem → solution */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-1">😮‍💨 {isMs ? "Kedengaran biasa?" : "Sound familiar?"}</h2>
        <p className="text-center text-soft text-sm mb-4">{isMs ? "Kami faham. Jom cuba cara yang anak suka." : "We get it. Try a way kids actually enjoy."}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {pains.map((p, i) => (
            <div key={p.t} className={`card p-5 ${i % 2 ? "sticker-r" : "sticker"}`}>
              <div className="text-4xl">{p.i}</div>
              <div className="font-display mt-1 text-violet-700">{p.t}</div>
              <div className="text-soft text-sm mt-1">✅ {p.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">📚 {isMs ? "Subjek Sekolah" : "School Subjects"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUBJECTS.map((subj) => (
            <div key={subj.id} className="card p-5 text-center" style={{ borderTop: `8px solid ${subj.color}` }}>
              <div className="text-5xl">{subj.icon}</div>
              <div className="font-display text-lg mt-2">{subj.name[s.locale]}</div>
              <div className="chip inline-block px-3 py-1 text-xs mt-2" style={{ color: subj.color }}>{subjectTopicCount(subj.id)} {isMs ? "topik" : "topics"}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-4 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">✨ {isMs ? "Ciri Utama" : "Key Features"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {features.map((f) => (
            <div key={f.t} className="card p-5"><div className="text-4xl">{f.i}</div><div className="font-display text-lg mt-1 text-violet-700">{f.t}</div><div className="text-soft text-sm mt-1">{f.d}</div></div>
          ))}
        </div>
      </section>

      {/* Gallery (game modes as showcase) */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">🎮 {isMs ? "Pelbagai Cara Main" : "Many Ways to Play"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GAME_MODES.map((m) => (
            <div key={m.id} className="card p-4 text-center" style={{ borderTop: `8px solid ${m.color}` }}>
              <div className="text-4xl">{m.icon}</div><div className="font-display mt-1">{m.name[s.locale]}</div><div className="text-[11px] text-soft">{m.desc[s.locale]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-4 max-w-3xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">🚀 {isMs ? "Mula Dalam 3 Langkah" : "Start in 3 Steps"}</h2>
        <div className="grid grid-cols-3 gap-3">
          {steps.map((st, i) => (
            <div key={st.t} className="card p-4 text-center relative">
              <div className="absolute -top-3 -left-2 chip w-9 h-9 grid place-items-center font-display text-violet-700">{i + 1}</div>
              <div className="text-4xl animate-bobble">{st.i}</div><div className="font-display text-sm mt-1">{st.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — renders only real, consented reviews */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">💬 {isMs ? "Apa Kata Ibu Bapa" : "What Parents Say"}</h2>
        {REVIEWS.length === 0 ? (
          <div className="card p-6 text-center">
            <div className="text-4xl">🌟</div>
            <div className="font-display text-lg mt-1 text-violet-700">{isMs ? "Jadi keluarga pertama beri ulasan!" : "Be the first family to review!"}</div>
            <p className="text-soft text-sm mt-1">{isMs ? "Ulasan sebenar daripada ibu bapa akan dipaparkan di sini." : "Real, verified parent reviews will appear here."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REVIEWS.map((r) => (
              <div key={r.name} className="card p-4">
                <div className="text-amber-400">★★★★★</div>
                <p className="text-sm mt-1">“{r.text}”</p>
                <div className="flex items-center gap-2 mt-2"><span className="text-2xl">{r.avatar}</span><div><div className="font-display text-sm">{r.name}</div><div className="text-[11px] text-soft">{r.place}</div></div></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pricing ladder */}
      <section className="px-4 py-4 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-1">🎟️ {isMs ? "Pelan" : "Plans"}</h2>
        <p className="text-center text-soft text-sm mb-4">{isMs ? "Mula percuma hari ini." : "Start free today."}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
          <div className="card p-5 text-center" style={{ borderTop: "8px solid #22c55e" }}>
            <div className="font-display text-lg">🌱 {isMs ? "Percuma" : "Free"}</div>
            <div className="font-display text-3xl text-green-600 my-1">RM0</div>
            <ul className="text-soft text-sm space-y-1 my-3">
              <li>✓ {isMs ? "Semua subjek" : "All subjects"}</li>
              <li>✓ {isMs ? "Soalan tanpa had" : "Unlimited questions"}</li>
              <li>✓ {isMs ? "Akaun & 1 profil anak" : "Account & 1 child profile"}</li>
            </ul>
            <button className="btn btn-go rounded-2xl px-6 py-3 font-display w-full" onClick={go}>{isMs ? "Main Sekarang" : "Play Now"}</button>
          </div>
          {[
            { t: isMs ? "🚀 Pakej Lengkap" : "🚀 Complete", f: isMs ? ["Sehingga 2 profil", "Dashboard penuh", "Sijil boleh cetak"] : ["Up to 2 profiles", "Full dashboard", "Printable certificates"] },
            { t: isMs ? "🏠 Pakej Keluarga" : "🏠 Family", f: isMs ? ["Sehingga 4 profil", "Keutamaan sokongan", "Semua ciri"] : ["Up to 4 profiles", "Priority support", "All features"] },
          ].map((p) => (
            <div key={p.t} className="card p-5 text-center opacity-90" style={{ borderTop: "8px solid #8b5cf6" }}>
              <div className="font-display text-lg">{p.t}</div>
              <div className="chip inline-block px-3 py-1 text-xs my-2 text-violet-700">{isMs ? "Akan datang" : "Coming soon"}</div>
              <ul className="text-soft text-sm space-y-1 my-3">{p.f.map((x) => <li key={x}>✓ {x}</li>)}</ul>
              <button className="btn rounded-2xl px-6 py-3 font-display w-full" disabled>{isMs ? "Segera" : "Soon"}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Email capture */}
      <section className="px-4 py-4 max-w-xl mx-auto"><EmailCapture isMs={isMs} /></section>

      {/* FAQ */}
      <section className="px-4 py-4 max-w-2xl mx-auto">
        <h2 className="font-display text-2xl text-center text-violet-700 mb-4">🤔 {isMs ? "Soalan Lazim" : "FAQ"}</h2>
        <div className="space-y-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="card p-4">
              <summary className="font-display cursor-pointer text-violet-700">{q}</summary>
              <p className="text-soft text-sm mt-2">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-6 max-w-2xl mx-auto text-center">
        <div className="card p-6 grad text-white">
          <div className="text-5xl animate-bobble">🎉</div>
          <h2 className="font-display text-2xl mt-2">{isMs ? "Jom mula belajar — percuma!" : "Start learning — for free!"}</h2>
          <button className="btn rounded-2xl px-8 py-4 font-display text-xl mt-3 text-violet-700" onClick={go}>🎮 {isMs ? "Main Sekarang" : "Play Now"}</button>
        </div>
      </section>

      <footer className="text-center text-soft text-xs py-6 px-4">
        {isMs ? "Dibina dengan ❤️ untuk anak Malaysia • KSSR Darjah 1–6 • Mematuhi PDPA" : "Built with ❤️ for Malaysian kids • KSSR Years 1–6 • PDPA-compliant"}
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-3 sm:hidden">
        <button className="btn btn-primary rounded-2xl px-6 py-4 font-display text-lg w-full shadow-xl" onClick={go}>🎮 {isMs ? "Cuba Percuma Sekarang" : "Try Free Now"}</button>
      </div>

      {/* Honest, real-data social proof */}
      <SocialProofToaster />
    </main>
  );
}
