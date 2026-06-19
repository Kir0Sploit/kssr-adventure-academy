"use client";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/store";
import { audio } from "@/lib/audio";
import { GAME_MODES } from "@/lib/games";
import SocialProofToaster from "./SocialProofToaster";
import { Logo, Icon } from "./Brand";
import { ImageWithFallback } from "./ImageWithFallback";
import { SUBJECTS, YEARS } from "@kssr/shared";
import { getTopicMetas, TOPIC_COUNT } from "@kssr/curriculum";

const MODES = GAME_MODES.length;
function subjectGames(subject: string): number {
  let n = 0;
  for (const y of YEARS) n += getTopicMetas(y, subject as never).length;
  return n * MODES;
}

/**
 * Sample testimonials for layout/demo. Replace with REAL, consented parent
 * reviews before launch (see the caption shown under the section).
 */
interface Review { name: string; place: string; text_ms: string; text_en: string; initial: string; color: string }
const SAMPLE_REVIEWS: Review[] = [
  { name: "Farhan A.", place: "Shah Alam", initial: "F", color: "#7c5cff", text_ms: "Jujur cakap, dulu nak suruh anak baca buku memang perang. Sekarang dia sendiri yang bukak app ni lepas balik sekolah. Sifir pun dah laju 😅", text_en: "Honestly, getting him to study used to be a battle. Now he opens the app himself after school. Times tables are way faster too." },
  { name: "Aishah", place: "Johor Bahru", initial: "A", color: "#18b6e8", text_ms: "Yang saya suka, soalan dia ikut sekolah (KSSR). Pendek-pendek je, jadi anak tak rasa macam belajar pun. Berbaloi.", text_en: "What I like is it follows the school syllabus (KSSR). Short questions, so it doesn't feel like studying. Worth it." },
  { name: "Cikgu Roslan", place: "Alor Setar", initial: "R", color: "#16b45b", text_ms: "Saya guna dalam kelas pemulihan. Bahagian Jawi & suara baca tu sangat membantu murid yang lemah membaca.", text_en: "I use it in my remedial class. The Jawi section and read-aloud voice really help weaker readers." },
  { name: "Mei Ling", place: "Petaling Jaya", initial: "M", color: "#f0883e", text_ms: "Dua-dua anak guna satu akaun. Senang nak tengok siapa lemah subjek apa kat dashboard tu.", text_en: "Both my kids use one account. The dashboard makes it easy to see who's weak in which subject." },
  { name: "Hafiz", place: "Kuantan", initial: "H", color: "#e0567a", text_ms: "Anak memang minat tablet. At least sekarang dia main sambil belajar Sains & Sejarah, bukan tengok video je.", text_en: "My boy loves his tablet. At least now he plays while learning Science & History instead of just watching videos." },
  { name: "Nurul", place: "Kota Bharu", initial: "N", color: "#2fb39a", text_ms: "Boleh main offline masa balik kampung. Tak payah risau data, anak pun tak boring dalam kereta.", text_en: "Works offline on the drive back. No data worries and the kids aren't bored in the car." },
];

function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} stars`}>
      {Array.from({ length: n }).map((_, i) => <Icon key={i} name="star" size={16} color="#ffb300" />)}
    </span>
  );
}

/** Review avatar: shows a real photo if available, else a colored initial. */
function ReviewAvatar({ src, initial, color }: { src?: string; initial: string; color: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="w-11 h-11 rounded-full grid place-items-center font-display text-white shrink-0" style={{ background: color }}>{initial}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" onError={() => setFailed(true)} className="w-11 h-11 rounded-full object-cover shrink-0" />;
}

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
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, consent }) });
      setState((await r.json()).ok ? "ok" : "err");
    } catch { setState("err"); }
    setBusy(false);
  };
  if (state === "ok") return <div className="card p-5 text-center font-display text-green-600">🎉 {isMs ? "Terima kasih! Kami akan e-mel anda." : "Thanks! We'll email you."}</div>;
  return (
    <div className="card p-5">
      <div className="font-display text-lg text-violet-700">{isMs ? "Dapatkan berita & promosi" : "Get news & offers"}</div>
      <p className="text-soft text-sm mb-3">{isMs ? "Tinggalkan e-mel untuk kemas kini terkini." : "Leave your email for the latest updates."}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input className="flex-1 rounded-2xl px-4 py-3 bg-slate-50 border-2 border-slate-200 font-semibold text-slate-800 outline-none focus:border-violet-400" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-primary rounded-2xl px-6 py-3 font-display" disabled={busy || !consent} onClick={submit}>{isMs ? "Daftar" : "Subscribe"}</button>
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
  const go = () => { audio.unlock(); audio.click(); onStart(); };
  const parent = () => { audio.click(); onParent(); };
  const totalGames = TOPIC_COUNT * MODES;

  // Pull real, published reviews from the CMS; fall back to sample copy.
  const [realReviews, setRealReviews] = useState<{ id: string; name: string; place?: string; text: string; rating: number; photoUrl?: string }[]>([]);
  useEffect(() => {
    fetch("/api/reviews").then((r) => r.json()).then((d) => { if (Array.isArray(d.reviews)) setRealReviews(d.reviews); }).catch(() => {});
  }, []);
  const COLORS = ["#7c5cff", "#18b6e8", "#16b45b", "#f0883e", "#e0567a", "#2fb39a"];

  const features = [
    { icon: "play" as const, t: isMs ? "Belajar Sambil Main" : "Learn Through Play", d: isMs ? "Soalan pendek, ganjaran segera, anak kekal fokus." : "Short questions, instant rewards, kids stay focused." },
    { icon: "voice" as const, t: isMs ? "Suara BM & English" : "Malay & English Voice", d: isMs ? "Soalan dibaca kuat untuk anak yang baru membaca." : "Questions read aloud for early readers." },
    { icon: "chart" as const, t: isMs ? "Dashboard Ibu Bapa" : "Parent Dashboard", d: isMs ? "Pantau ketepatan, masa & topik perlu latihan." : "Track accuracy, time & topics needing practice." },
    { icon: "star" as const, t: isMs ? "Bintang & Streak" : "Stars & Streaks", d: isMs ? "Kumpul bintang, lencana & streak harian." : "Collect stars, badges & a daily streak." },
    { icon: "book" as const, t: isMs ? "Ikut Silibus KSSR" : "KSSR-aligned", d: isMs ? "7 subjek, Darjah 1 hingga 6." : "7 subjects, Years 1 to 6." },
    { icon: "shield" as const, t: isMs ? "Selamat & Tanpa Iklan" : "Safe & Ad-free", d: isMs ? "Akaun ibu bapa, tiada iklan, mematuhi PDPA." : "Parent accounts, no ads, PDPA-compliant." },
  ];

  return (
    <main className="min-h-screen pb-24 sm:pb-0 bg-white/0">
      {/* Nav */}
      <header className="sticky top-0 z-30 px-3 py-2">
        <div className="panel rounded-2xl flex items-center gap-3 p-2.5">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <button className="btn !min-h-0 rounded-xl px-3 py-2 text-sm" onClick={() => s.setLocale(isMs ? "en" : "ms")}>{isMs ? "EN" : "BM"}</button>
            <button className="btn !min-h-0 rounded-xl px-3 py-2 text-sm hidden sm:inline-flex items-center gap-1" onClick={parent}>
              <Icon name="lock" size={15} /> {isMs ? "Log Masuk" : "Log In"}
            </button>
            <button className="btn btn-primary !min-h-0 rounded-xl px-4 py-2 font-display inline-flex items-center gap-1.5" onClick={go}>
              <Icon name="play" size={16} color="#fff" /> {isMs ? "Mula" : "Start"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-6 pb-2 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="animate-slideUp">
          <span className="inline-flex items-center gap-1.5 chip px-3 py-1.5 text-sm"><Icon name="check" size={15} color="#16a34a" /> {isMs ? "Platform pembelajaran KSSR" : "KSSR learning platform"}</span>
          <h1 className="font-display text-4xl sm:text-5xl text-slate-800 mt-4 leading-[1.1]">
            {isMs ? "Belajar Sambil Bermain dengan KSSR Adventure Academy" : "Learn Through Play with KSSR Adventure Academy"}
          </h1>
          <p className="text-soft text-lg mt-4">
            {isMs ? `${totalGames.toLocaleString()}+ permainan pembelajaran merentas 7 subjek — Darjah 1 hingga 6. Ceria, berstruktur, dan selamat untuk anak.` : `${totalGames.toLocaleString()}+ learning games across 7 subjects — Years 1 to 6. Cheerful, structured, and safe for kids.`}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button className="btn btn-primary rounded-2xl px-7 py-4 font-display text-lg inline-flex items-center gap-2" onClick={go}>
              <Icon name="play" size={18} color="#fff" /> {isMs ? "Mula Belajar" : "Start Learning"}
            </button>
            <button className="btn rounded-2xl px-6 py-4 font-display text-lg inline-flex items-center gap-2" onClick={parent}>
              <Icon name="chart" size={18} /> {isMs ? "Daftar Ibu Bapa" : "Parent Sign-up"}
            </button>
          </div>
          <div className="flex items-center gap-4 mt-5 text-sm text-soft">
            <span className="inline-flex items-center gap-1.5"><Icon name="shield" size={16} color="#16a34a" /> {isMs ? "Selamat" : "Safe"}</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="offline" size={16} color="#2563eb" /> {isMs ? "Offline" : "Offline"}</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "Tiada Iklan" : "No Ads"}</span>
          </div>
        </div>

        {/* Phone mockup + floating stat */}
        <div className="relative justify-self-center animate-pop">
          <div className="rounded-[2.2rem] p-3 bg-slate-900/10 border-4 border-white shadow-2xl w-[260px]">
            <div className="rounded-[1.6rem] overflow-hidden bg-white">
              <div className="grad text-white text-xs font-bold px-3 py-2 flex justify-between"><span className="inline-flex items-center gap-1"><Icon name="book" size={13} color="#fff" /> Matematik</span><span>9:41</span></div>
              <div className="p-3">
                <div className="text-[11px] text-soft font-bold flex justify-between"><span>Tahun 3</span><span className="inline-flex items-center gap-0.5"><Icon name="star" size={12} color="#ffb300" /> 3/8</span></div>
                <div className="rounded-2xl p-4 mt-2 text-center bg-slate-50 border border-slate-100"><div className="font-display text-2xl text-slate-800">7 × 6 = ?</div></div>
                <div className="grid gap-2 mt-2">
                  {["42", "36", "48"].map((o, i) => (
                    <div key={o} className="rounded-xl py-2 font-display text-center text-sm" style={i === 0 ? { background: "#36b14f", color: "#fff" } : { background: "#f1f0fb", color: "#2b2350" }}>{o}</div>
                  ))}
                </div>
                <div className="text-center font-display text-green-600 mt-2 text-sm">Hebat! 🎉</div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 card px-3 py-2 flex items-center gap-2 shadow-lg">
            <Icon name="medal" size={22} color="#ffb300" />
            <div className="leading-none"><div className="font-display text-violet-700">7</div><div className="text-[10px] text-soft">{isMs ? "subjek" : "subjects"}</div></div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 my-6 max-w-4xl mx-auto">
        <div className="card grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          {[
            [`${totalGames.toLocaleString()}+`, isMs ? "Permainan" : "Games"],
            [`${TOPIC_COUNT}+`, isMs ? "Topik" : "Topics"],
            ["7", isMs ? "Subjek" : "Subjects"],
            ["1–6", isMs ? "Darjah" : "Years"],
          ].map(([v, l]) => (
            <div key={l} className="p-4 text-center">
              <div className="font-display text-2xl sm:text-3xl text-violet-700">{v}</div>
              <div className="text-xs text-soft font-semibold mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects with real game counts */}
      <section className="px-4 py-6 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-center text-slate-800 mb-1">{isMs ? "7 Subjek Sekolah" : "7 School Subjects"}</h2>
        <p className="text-center text-soft mb-6">{isMs ? "Setiap subjek penuh dengan permainan ikut KSSR" : "Each subject packed with KSSR-aligned games"}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUBJECTS.map((subj) => (
            <div key={subj.id} className="card p-4 text-center" style={{ borderTop: `5px solid ${subj.color}` }}>
              <div className="text-4xl">{subj.icon}</div>
              <div className="font-display mt-2">{subj.name[s.locale]}</div>
              <div className="text-xs font-bold mt-1" style={{ color: subj.color }}>{subjectGames(subj.id)}+ {isMs ? "permainan" : "games"}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-6 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-center text-slate-800 mb-6">{isMs ? "Kenapa Ibu Bapa Pilih Kami" : "Why Parents Choose Us"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.t} className="card p-5">
              <div className="w-12 h-12 rounded-2xl grid place-items-center mb-3" style={{ background: "#efeafe" }}>
                <Icon name={f.icon} size={24} color="#7c5cff" />
              </div>
              <div className="font-display text-lg text-slate-800">{f.t}</div>
              <div className="text-soft text-sm mt-1">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Game modes */}
      <section className="px-4 py-6 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-center text-slate-800 mb-6">{isMs ? "Pelbagai Cara Bermain" : "Many Ways to Play"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GAME_MODES.map((m) => (
            <div key={m.id} className="card p-4 text-center" style={{ borderTop: `5px solid ${m.color}` }}>
              <div className="text-3xl">{m.icon}</div><div className="font-display mt-1">{m.name[s.locale]}</div><div className="text-[11px] text-soft">{m.desc[s.locale]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-6 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-center text-slate-800 mb-1">{isMs ? "Apa Kata Ibu Bapa" : "What Parents Say"}</h2>
        {realReviews.length === 0 && (
          <p className="text-center text-soft text-xs mb-6">{isMs ? "Contoh paparan — akan digantikan dengan ulasan sebenar melalui panel admin." : "Sample layout — replaced by real reviews via the admin panel."}</p>
        )}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${realReviews.length === 0 ? "" : "mt-6"}`}>
          {(realReviews.length > 0
            ? realReviews.map((r, i) => ({ key: r.id, name: r.name, place: r.place ?? "", text: r.text, rating: r.rating || 5, src: r.photoUrl, initial: (r.name[0] || "?").toUpperCase(), color: COLORS[i % COLORS.length]! }))
            : SAMPLE_REVIEWS.map((r, i) => ({ key: r.name, name: r.name, place: r.place, text: isMs ? r.text_ms : r.text_en, rating: 5, src: `/reviews/${i + 1}.jpg`, initial: r.initial, color: r.color }))
          ).map((r) => (
            <div key={r.key} className="card p-5">
              <Stars n={r.rating} />
              <p className="text-sm mt-2 text-slate-700">“{r.text}”</p>
              <div className="flex items-center gap-3 mt-4">
                <ReviewAvatar src={r.src} initial={r.initial} color={r.color} />
                <div><div className="font-display text-sm text-slate-800">{r.name}</div><div className="text-[11px] text-soft">{r.place}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery — drop real screenshots into /public/gallery/N.jpg */}
      <section className="px-4 py-6 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-center text-slate-800 mb-1">{isMs ? "Lihat Dalam Aplikasi" : "See It In Action"}</h2>
        <p className="text-center text-soft mb-6">{isMs ? "Tangkap layar sebenar daripada permainan" : "Real screenshots from the games"}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <ImageWithFallback key={n} src={`/gallery/${n}.jpg`} alt={`Screenshot ${n}`} label={isMs ? "Muat naik tangkap layar" : "Upload screenshot"} />
          ))}
        </div>
      </section>

      {/* Email capture */}
      <section className="px-4 py-6 max-w-xl mx-auto"><EmailCapture isMs={isMs} /></section>

      {/* FAQ */}
      <section className="px-4 py-6 max-w-2xl mx-auto">
        <h2 className="font-display text-3xl text-center text-slate-800 mb-6">{isMs ? "Soalan Lazim" : "FAQ"}</h2>
        <div className="space-y-2">
          {(isMs
            ? [["Adakah selamat untuk anak?", "Ya — akaun ibu bapa, tiada iklan, tiada chat dengan orang asing."], ["Ikut silibus Malaysia?", "Ya, kandungan ikut KSSR Darjah 1–6 untuk 7 subjek."], ["Perlu log masuk?", "Ya. Ibu bapa daftar akaun, kemudian buat profil anak untuk simpan kemajuan."], ["Perlu internet?", "Tidak. Selepas dibuka, boleh dimainkan offline."]]
            : [["Is it safe for kids?", "Yes — parent accounts, no ads, no chatting with strangers."], ["Follows Malaysian syllabus?", "Yes, KSSR Years 1–6 across 7 subjects."], ["Do I need to log in?", "Yes. Parents create an account, then child profiles to save progress."], ["Need internet?", "No. Once loaded, it plays offline."]]
          ).map(([q, a]) => (
            <details key={q} className="card p-4"><summary className="font-display cursor-pointer text-slate-800">{q}</summary><p className="text-soft text-sm mt-2">{a}</p></details>
          ))}
        </div>
      </section>

      {/* Pricing / Bundle */}
      <section id="pricing" className="px-4 py-8 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl text-center text-slate-800 mb-1">{isMs ? "Pilih Pakej Anda" : "Choose Your Plan"}</h2>
        <p className="text-center text-soft mb-6">
          {isMs ? "Bantu anak yang suka skrin belajar sambil bermain — pada harga mesra ibu bapa." : "Help screen-loving kids learn through play — at a parent-friendly price."}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 items-stretch">
          {/* Free */}
          <div className="card p-6 flex flex-col">
            <div className="font-display text-xl text-slate-800">{isMs ? "Percuma" : "Free"}</div>
            <div className="font-display text-4xl text-slate-800 mt-1">RM0</div>
            <div className="text-soft text-sm mb-4">{isMs ? "Untuk mula mencuba" : "To get started"}</div>
            <ul className="space-y-2 text-sm text-slate-700 flex-1">
              <li className="flex items-center gap-2"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "Semua 7 subjek" : "All 7 subjects"}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "Soalan & cabaran terhad" : "Limited questions & challenges"}</li>
              <li className="flex items-center gap-2 text-soft"><span className="w-4 text-center">✕</span> {isMs ? "Tiada lembaran kerja" : "No worksheets"}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "1 profil anak" : "1 child profile"}</li>
            </ul>
            <button className="btn rounded-2xl px-6 py-3 font-display w-full mt-5" onClick={go}>{isMs ? "Mula Percuma" : "Start Free"}</button>
          </div>

          {/* Bundle */}
          <div className="card p-6 flex flex-col relative ring-2" style={{ borderColor: "#7c5cff", boxShadow: "0 16px 40px rgba(109,92,255,.22)" }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 chip px-3 py-1 text-xs font-display" style={{ background: "#7c5cff", color: "#fff", border: "none" }}>
              {isMs ? "Paling Berbaloi · Jimat RM240" : "Best Value · Save RM240"}
            </span>
            <div className="font-display text-xl text-violet-700">{isMs ? "Pakej Lengkap" : "Complete Bundle"}</div>
            <div className="flex items-end gap-2 mt-1">
              <span className="font-display text-4xl text-slate-800">RM59</span>
              <span className="text-soft line-through text-lg">RM299</span>
            </div>
            <div className="text-soft text-xs mb-4">{isMs ? "Nilai penuh RM299 — harga membantu ibu bapa" : "Full value RM299 — a parent-help price"}</div>
            <ul className="space-y-2 text-sm text-slate-700 flex-1">
              <li className="flex items-center gap-2"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "Semua subjek & semua pakej" : "All subjects & all packages"}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "Soalan & cabaran tanpa had" : "Unlimited questions & challenges"}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "Lembaran kerja boleh cetak" : "Printable worksheets"}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "Dashboard penuh & sijil" : "Full dashboard & certificates"}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={16} color="#16a34a" /> {isMs ? "Sehingga 4 profil anak · semua akses" : "Up to 4 child profiles · all access"}</li>
            </ul>
            <button className="btn btn-primary rounded-2xl px-6 py-3 font-display w-full mt-5 inline-flex items-center justify-center gap-2" onClick={parent}>
              <Icon name="star" size={16} color="#fff" /> {isMs ? "Dapatkan Sekarang" : "Get the Bundle"}
            </button>
            <div className="text-[11px] text-soft text-center mt-2 inline-flex items-center justify-center gap-1">
              <Icon name="lock" size={12} /> {isMs ? "Bayaran selamat (FPX/kad) — akan datang" : "Secure payment (FPX/card) — coming soon"}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-8 max-w-3xl mx-auto">
        <div className="card p-8 grad text-white text-center">
          <h2 className="font-display text-3xl">{isMs ? "Sedia untuk mula?" : "Ready to start?"}</h2>
          <p className="opacity-90 mt-1">{isMs ? "Daftar akaun percuma & buat profil anak hari ini." : "Create a free account & set up a child profile today."}</p>
          <button className="btn rounded-2xl px-8 py-4 font-display text-lg mt-4 text-violet-700 inline-flex items-center gap-2" onClick={go}>
            <Icon name="play" size={18} color="#7c5cff" /> {isMs ? "Mula Sekarang" : "Get Started"}
          </button>
        </div>
      </section>

      <footer className="px-4 py-8 max-w-5xl mx-auto border-t border-slate-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo />
          <p className="text-soft text-xs text-center">{isMs ? "Dibina dengan teliti untuk anak Malaysia • KSSR Darjah 1–6 • Mematuhi PDPA" : "Crafted for Malaysian kids • KSSR Years 1–6 • PDPA-compliant"}</p>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-3 sm:hidden">
        <button className="btn btn-primary rounded-2xl px-6 py-4 font-display text-lg w-full shadow-xl inline-flex items-center justify-center gap-2" onClick={go}>
          <Icon name="play" size={18} color="#fff" /> {isMs ? "Mula Belajar" : "Start Learning"}
        </button>
      </div>

      <SocialProofToaster />
    </main>
  );
}
