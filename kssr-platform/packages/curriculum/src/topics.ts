/**
 * Topic catalog. Compact skill "templates" expand into one topic per year,
 * producing 100+ topics across all subjects. Each topic is backed by the
 * generator, so its questions are fresh and effectively unlimited.
 */
import type { Flashcard, Localized, SubjectId, Topic, Year } from "@kssr/shared";
import { generate, isGeneratable } from "./generators.js";

interface Template {
  key: string;
  subject: SubjectId;
  skill: string;
  icon: string;
  title: Localized;
  desc: Localized;
  years: Year[];
}

const T: Template[] = [
  // ---------------- MATHEMATICS ----------------
  { key: "count", subject: "math", skill: "counting", icon: "🔢", title: { en: "Counting Fun", ms: "Seronok Mengira" }, desc: { en: "Count objects and numbers.", ms: "Kira objek dan nombor." }, years: [1, 2] },
  { key: "add", subject: "math", skill: "addition", icon: "➕", title: { en: "Addition", ms: "Penambahan" }, desc: { en: "Add numbers together.", ms: "Menambah nombor." }, years: [1, 2, 3, 4] },
  { key: "sub", subject: "math", skill: "subtraction", icon: "➖", title: { en: "Subtraction", ms: "Penolakan" }, desc: { en: "Take away to find the rest.", ms: "Menolak untuk cari baki." }, years: [1, 2, 3, 4] },
  { key: "mul", subject: "math", skill: "multiplication", icon: "✖️", title: { en: "Multiplication", ms: "Pendaraban" }, desc: { en: "Times tables and groups.", ms: "Sifir dan kumpulan." }, years: [2, 3, 4, 5] },
  { key: "div", subject: "math", skill: "division", icon: "➗", title: { en: "Division", ms: "Pembahagian" }, desc: { en: "Share equally.", ms: "Bahagi sama rata." }, years: [3, 4, 5] },
  { key: "compare", subject: "math", skill: "compare", icon: "⚖️", title: { en: "Bigger or Smaller", ms: "Besar atau Kecil" }, desc: { en: "Compare numbers.", ms: "Banding nombor." }, years: [1, 2, 3] },
  { key: "skip", subject: "math", skill: "skip-counting", icon: "🦘", title: { en: "Skip Counting", ms: "Kira Lompat" }, desc: { en: "Count in 2s, 5s, 10s.", ms: "Kira dua, lima, sepuluh." }, years: [1, 2, 3] },
  { key: "money", subject: "math", skill: "money", icon: "💰", title: { en: "Money & Change", ms: "Wang & Baki" }, desc: { en: "Shop and give change.", ms: "Beli-belah dan beri baki." }, years: [2, 3, 4, 5] },
  { key: "fracof", subject: "math", skill: "fraction-of", icon: "🍕", title: { en: "Fractions", ms: "Pecahan" }, desc: { en: "Find a fraction of a number.", ms: "Cari pecahan daripada nombor." }, years: [3, 4, 5, 6] },
  { key: "pct", subject: "math", skill: "percentage", icon: "💯", title: { en: "Percentage", ms: "Peratus" }, desc: { en: "Find a percentage.", ms: "Cari peratus." }, years: [5, 6] },
  { key: "dec", subject: "math", skill: "decimals", icon: "🔟", title: { en: "Decimals", ms: "Perpuluhan" }, desc: { en: "Add decimal numbers.", ms: "Tambah nombor perpuluhan." }, years: [5, 6] },
  { key: "word", subject: "math", skill: "word-problem", icon: "🧩", title: { en: "Word Problems", ms: "Masalah Berayat" }, desc: { en: "Solve real-life sums.", ms: "Selesai masalah harian." }, years: [2, 3, 4, 5, 6] },
  { key: "round", subject: "math", skill: "rounding", icon: "📍", title: { en: "Rounding", ms: "Pembundaran" }, desc: { en: "Round to the nearest ten.", ms: "Bundar ke puluh terdekat." }, years: [3, 4, 5] },

  // ---------------- BAHASA MELAYU ----------------
  { key: "suku", subject: "bm", skill: "suku-kata", icon: "🔤", title: { en: "Syllables", ms: "Suku Kata" }, desc: { en: "Build words from syllables.", ms: "Bina perkataan dari suku kata." }, years: [1, 2] },
  { key: "vocab", subject: "bm", skill: "vocabulary", icon: "📖", title: { en: "Vocabulary", ms: "Kosa Kata" }, desc: { en: "Learn new Malay words.", ms: "Belajar perkataan baharu." }, years: [1, 2, 3, 4] },
  { key: "warna", subject: "bm", skill: "opposites-basic", icon: "🎨", title: { en: "Colours & Opposites", ms: "Warna & Lawan" }, desc: { en: "Colours and opposite words.", ms: "Warna dan lawan kata." }, years: [1, 2] },
  { key: "antonim", subject: "bm", skill: "antonym", icon: "↔️", title: { en: "Antonyms", ms: "Antonim" }, desc: { en: "Opposite-meaning words.", ms: "Perkataan berlawanan." }, years: [2, 3, 4, 5] },
  { key: "sinonim", subject: "bm", skill: "synonym", icon: "🟰", title: { en: "Synonyms", ms: "Sinonim" }, desc: { en: "Same-meaning words.", ms: "Perkataan sama maksud." }, years: [2, 3, 4, 5, 6] },
  { key: "imbuhan", subject: "bm", skill: "imbuhan", icon: "🧩", title: { en: "Prefixes (Imbuhan)", ms: "Imbuhan" }, desc: { en: "Add me-, ber- to words.", ms: "Tambah me-, ber- pada kata." }, years: [2, 3, 4, 5] },
  { key: "penjodoh", subject: "bm", skill: "penjodoh", icon: "🔢", title: { en: "Measure Words", ms: "Penjodoh Bilangan" }, desc: { en: "Counting words for nouns.", ms: "Kata bilangan untuk nama." }, years: [3, 4, 5, 6] },
  { key: "peribahasa", subject: "bm", skill: "peribahasa", icon: "📜", title: { en: "Proverbs", ms: "Peribahasa" }, desc: { en: "Wise Malay sayings.", ms: "Kata-kata bijak Melayu." }, years: [3, 4, 5, 6] },

  // ---------------- ENGLISH ----------------
  { key: "envocab", subject: "english", skill: "vocabulary", icon: "📕", title: { en: "Vocabulary", ms: "Kosa Kata" }, desc: { en: "Learn new English words.", ms: "Belajar perkataan Inggeris." }, years: [1, 2, 3, 4, 5] },
  { key: "ensyn", subject: "english", skill: "synonym", icon: "🟰", title: { en: "Synonyms", ms: "Sinonim" }, desc: { en: "Words that mean the same.", ms: "Perkataan sama maksud." }, years: [3, 4, 5, 6] },
  { key: "enant", subject: "english", skill: "antonym", icon: "↔️", title: { en: "Antonyms", ms: "Antonim" }, desc: { en: "Opposite words.", ms: "Perkataan berlawanan." }, years: [3, 4, 5, 6] },
  { key: "plural", subject: "english", skill: "plural", icon: "🔁", title: { en: "Plurals", ms: "Kata Jamak" }, desc: { en: "More than one.", ms: "Lebih daripada satu." }, years: [2, 3, 4] },
  { key: "past", subject: "english", skill: "past-tense", icon: "⏪", title: { en: "Past Tense", ms: "Kata Lampau" }, desc: { en: "Talk about the past.", ms: "Bercakap tentang lampau." }, years: [3, 4, 5] },
  { key: "prep", subject: "english", skill: "preposition", icon: "📍", title: { en: "Where Things Are", ms: "Kedudukan Benda" }, desc: { en: "in, on, under, next to.", ms: "in, on, under, next to." }, years: [2, 3, 4] },
  { key: "grammar", subject: "english", skill: "grammar", icon: "✏️", title: { en: "Grammar", ms: "Tatabahasa" }, desc: { en: "Correct sentences.", ms: "Ayat yang betul." }, years: [4, 5, 6] },
  { key: "adj", subject: "english", skill: "adjective", icon: "🌈", title: { en: "Adjectives", ms: "Kata Adjektif" }, desc: { en: "Describing words.", ms: "Perkataan penerang." }, years: [2, 3, 4] },
];

export interface TopicMeta {
  id: string;
  subject: SubjectId;
  year: Year;
  order: number;
  icon: string;
  title: Localized;
  description: Localized;
  skill: string;
}

const METAS: TopicMeta[] = (() => {
  const out: TopicMeta[] = [];
  const orderByYearSubject = new Map<string, number>();
  for (const tpl of T) {
    for (const year of tpl.years) {
      const k = `${year}:${tpl.subject}`;
      const order = (orderByYearSubject.get(k) ?? 0) + 1;
      orderByYearSubject.set(k, order);
      out.push({
        id: `${tpl.subject}-y${year}-${tpl.key}`,
        subject: tpl.subject,
        year,
        order,
        icon: tpl.icon,
        title: tpl.title,
        description: tpl.desc,
        skill: tpl.skill,
      });
    }
  }
  return out;
})();

export const TOPIC_COUNT = METAS.length;

export function getTopicMetas(year: Year, subject: SubjectId): TopicMeta[] {
  return METAS.filter((m) => m.year === year && m.subject === subject).sort((a, b) => a.order - b.order);
}

export function allYearSubjects(): Array<{ year: Year; subject: SubjectId }> {
  const seen = new Set<string>();
  const out: Array<{ year: Year; subject: SubjectId }> = [];
  for (const m of METAS) {
    const k = `${m.year}:${m.subject}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push({ year: m.year, subject: m.subject });
    }
  }
  return out;
}

function genFlashcard(meta: TopicMeta): Flashcard {
  const sample = generate(meta.id, meta.subject, meta.skill, meta.year, 1)[0];
  const ex = sample ? `${sample.prompt.en}  →  ${sample.options.find((o) => o.correct)?.label ?? ""}` : "";
  return {
    id: `${meta.id}-fc`,
    topicId: meta.id,
    title: meta.title,
    definition: meta.description,
    example: { en: ex, ms: ex },
    illustration: meta.icon,
    hint: { en: "Read carefully, then choose.", ms: "Baca dengan teliti, kemudian pilih." },
    funFact: { en: "Practice a little every day!", ms: "Berlatih sedikit setiap hari!" },
  };
}

/** Build a full Topic (with baked challenges) from a meta descriptor. */
export function buildTopic(meta: TopicMeta, challengeCount = 6): Topic {
  return {
    id: meta.id,
    subject: meta.subject,
    year: meta.year,
    title: meta.title,
    description: meta.description,
    order: meta.order,
    icon: meta.icon,
    skill: meta.skill,
    flashcards: [genFlashcard(meta)],
    challenges: generate(meta.id, meta.subject, meta.skill, meta.year, Math.max(1, challengeCount)),
  };
}

export { isGeneratable };
