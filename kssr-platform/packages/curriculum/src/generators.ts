/**
 * Question generators — the engine behind (near) unlimited variety.
 *
 * Math is fully procedural (effectively infinite, always correct).
 * Bahasa Melayu and English draw from large word banks and build
 * multiple-choice questions with sensible distractors. Pure TS, so it runs
 * identically on the server and in the browser.
 */
import type { Challenge, ChallengeMechanic, Difficulty, SubjectId, Year } from "@kssr/shared";

export type GenQ = Omit<Challenge, "id" | "topicId">;

function ri(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function pick<T>(a: readonly T[]): T {
  return a[Math.floor(Math.random() * a.length)] as T;
}
function shuffle<T>(a: readonly T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}
/** Pick n distinct items from a pool, excluding given values. */
function sampleDistinct(pool: readonly string[], n: number, exclude: string[]): string[] {
  const out: string[] = [];
  const seen = new Set(exclude.map((x) => x.toLowerCase()));
  for (const v of shuffle(pool)) {
    if (out.length >= n) break;
    if (!seen.has(v.toLowerCase())) {
      out.push(v);
      seen.add(v.toLowerCase());
    }
  }
  return out;
}

function mc(
  subject: SubjectId,
  year: Year,
  skill: string,
  mechanic: ChallengeMechanic,
  difficulty: Difficulty,
  promptEn: string,
  promptMs: string,
  correct: string,
  distractors: string[],
  hintEn: string,
  hintMs: string,
): GenQ {
  const opts = shuffle([correct, ...distractors.slice(0, 2)]);
  return {
    subject,
    year,
    difficulty,
    mechanic,
    prompt: { en: promptEn, ms: promptMs },
    options: opts.map((label, i) => ({ id: `o${i}`, label, correct: label === correct })),
    hint: { en: hintEn, ms: hintMs },
    skills: [skill],
  };
}

const MECH: ChallengeMechanic[] = ["lane-select", "gate-pass", "collect"];

/* ============================ MATH ============================ */
function diffByYear(year: Year): Difficulty {
  return year <= 2 ? "intro" : year <= 4 ? "core" : "stretch";
}

function genMath(skill: string, year: Year): GenQ {
  const d = diffByYear(year);
  const m: ChallengeMechanic = pick(["gate-pass", "lane-select"]);
  const wrongs = (ans: number, spread = 5): string[] => {
    const set = new Set<number>();
    let g = 0;
    while (set.size < 4 && g < 60) {
      g++;
      const delta = ri(-spread, spread) || 1;
      const v = ans + delta;
      if (v !== ans && v >= 0) set.add(v);
    }
    // Guarantee enough distinct distractors (avoids any infinite loop).
    let n = ans + 1;
    while (set.size < 4) {
      if (n !== ans && n >= 0) set.add(n);
      n++;
    }
    return [...set].map(String);
  };
  const objects = ["apples", "mangoes", "stars", "coins", "fish", "books", "balloons"];
  const objMs = ["epal", "mangga", "bintang", "syiling", "ikan", "buku", "belon"];
  const oi = ri(0, objects.length - 1);

  switch (skill) {
    case "counting": {
      const n = ri(3, year <= 1 ? 9 : 15);
      const icons = "⭐".repeat(n);
      return mc("math", year, skill, "collect", "intro", `Count: ${icons}`, `Kira: ${icons}`, String(n), wrongs(n, 3), "Count one by one.", "Kira satu demi satu.");
    }
    case "addition": {
      const cap = year <= 1 ? 9 : year <= 2 ? 40 : 100;
      const a = ri(1, cap), b = ri(1, cap), ans = a + b;
      return mc("math", year, skill, m, d, `${a} + ${b} = ?`, `${a} + ${b} = ?`, String(ans), wrongs(ans), "Add carefully.", "Tambah dengan teliti.");
    }
    case "subtraction": {
      const cap = year <= 1 ? 10 : year <= 2 ? 50 : 100;
      const a = ri(5, cap), b = ri(1, a), ans = a - b;
      return mc("math", year, skill, m, d, `${a} − ${b} = ?`, `${a} − ${b} = ?`, String(ans), wrongs(ans), "Count back.", "Kira undur.");
    }
    case "multiplication": {
      const top = year <= 2 ? 5 : year <= 3 ? 9 : 12;
      const a = ri(2, top), b = ri(2, top), ans = a * b;
      return mc("math", year, skill, m, d, `${a} × ${b} = ?`, `${a} × ${b} = ?`, String(ans), wrongs(ans, 8), "Repeated addition.", "Penambahan berulang.");
    }
    case "division": {
      const b = ri(2, year <= 3 ? 6 : 9), q = ri(2, year <= 3 ? 6 : 9), a = b * q;
      return mc("math", year, skill, m, d, `${a} ÷ ${b} = ?`, `${a} ÷ ${b} = ?`, String(q), wrongs(q, 4), `Which × ${b} = ${a}?`, `Mana × ${b} = ${a}?`);
    }
    case "compare": {
      const a = ri(1, 99), b = ri(1, 99) + (Math.random() < .5 ? 0 : 0);
      const bigger = Math.max(a, b), smaller = Math.min(a, b);
      const ans = String(bigger);
      return mc("math", year, skill, "lane-select", "intro", `Which is bigger: ${a} or ${b}?`, `Mana lebih besar: ${a} atau ${b}?`, ans, [String(smaller), String(bigger + 1)], "More is bigger.", "Banyak lebih besar.");
    }
    case "skip-counting": {
      const step = pick([2, 5, 10]); const start = step * ri(1, 4);
      const seq = [start, start + step, start + 2 * step]; const ans = start + 3 * step;
      return mc("math", year, skill, "lane-select", d, `Count in ${step}s: ${seq.join(", ")}, ?`, `Kira ${step}-${step}: ${seq.join(", ")}, ?`, String(ans), wrongs(ans, step + 2), `Add ${step}.`, `Tambah ${step}.`);
    }
    case "money": {
      const a = ri(2, 9), b = ri(1, a); const paid = a, cost = b, change = a - b;
      return mc("math", year, skill, m, d, `Pay RM${paid} for a RM${cost} toy. Change?`, `Bayar RM${paid} untuk mainan RM${cost}. Baki?`, `RM${change}`, wrongs(change, 3).map((x) => `RM${x}`), `${paid} − ${cost}.`, `${paid} − ${cost}.`);
    }
    case "fraction-of": {
      const den = pick([2, 3, 4, 5]); const q = ri(2, 8); const whole = den * q; const ans = q;
      return mc("math", year, skill, "lane-select", d, `1/${den} of ${whole} is?`, `1/${den} daripada ${whole} ialah?`, String(ans), wrongs(ans, 4), `${whole} ÷ ${den}.`, `${whole} ÷ ${den}.`);
    }
    case "percentage": {
      const pct = pick([10, 20, 25, 50]); const base = pct === 25 ? ri(1, 8) * 4 : ri(2, 9) * 10; const ans = Math.round((base * pct) / 100);
      return mc("math", year, skill, "lane-select", "stretch", `${pct}% of ${base} is?`, `${pct}% daripada ${base} ialah?`, String(ans), wrongs(ans, 6), `${base} × ${pct} ÷ 100.`, `${base} × ${pct} ÷ 100.`);
    }
    case "decimals": {
      const a = ri(1, 8) + ri(0, 9) / 10; const b = ri(1, 8) + ri(0, 9) / 10; const ans = +(a + b).toFixed(1);
      return mc("math", year, skill, "gate-pass", "stretch", `${a.toFixed(1)} + ${b.toFixed(1)} = ?`, `${a.toFixed(1)} + ${b.toFixed(1)} = ?`, ans.toFixed(1), [(ans + 0.1).toFixed(1), (ans - 0.2).toFixed(1), (ans + 1).toFixed(1)], "Line up the points.", "Susun titik perpuluhan.");
    }
    case "word-problem": {
      const a = ri(2, 9), b = ri(2, 9), ans = a * b;
      return mc("math", year, skill, "lane-select", d, `${a} baskets, ${b} ${objects[oi]} each. Total?`, `${a} bakul, ${b} ${objMs[oi]} setiap satu. Jumlah?`, String(ans), wrongs(ans, 6), `${a} × ${b}.`, `${a} × ${b}.`);
    }
    case "rounding": {
      const n = ri(11, 89); const ans = Math.round(n / 10) * 10;
      return mc("math", year, skill, "lane-select", "core", `Round ${n} to the nearest 10.`, `Bundarkan ${n} ke puluh terdekat.`, String(ans), [String(ans + 10), String(ans - 10), String(n)], "Look at the ones digit.", "Lihat digit sa.");
    }
    default: {
      const a = ri(1, 20), b = ri(1, 20), ans = a + b;
      return mc("math", year, "addition", m, d, `${a} + ${b} = ?`, `${a} + ${b} = ?`, String(ans), wrongs(ans), "Add carefully.", "Tambah teliti.");
    }
  }
}

/* ====================== LANGUAGE BANKS ====================== */
interface Item { en: string; ms: string; a: string; d: string[] }

const BANKS: Record<string, Item[]> = {
  "bm:vocabulary": [
    { en: "Which word means 'cat'?", ms: "Perkataan manakah bermaksud kucing?", a: "kucing", d: ["anjing", "ikan", "burung"] },
    { en: "Which word means 'house'?", ms: "Perkataan manakah bermaksud house?", a: "rumah", d: ["sekolah", "kedai", "kereta"] },
    { en: "Which is a fruit (buah)?", ms: "Manakah sejenis buah?", a: "pisang", d: ["meja", "kasut", "baju"] },
    { en: "Which word means 'book'?", ms: "Perkataan manakah bermaksud book?", a: "buku", d: ["pen", "meja", "kerusi"] },
    { en: "Which word means 'water'?", ms: "Perkataan manakah bermaksud water?", a: "air", d: ["api", "angin", "tanah"] },
    { en: "Which is an animal (haiwan)?", ms: "Manakah sejenis haiwan?", a: "harimau", d: ["batu", "meja", "buku"] },
    { en: "Which word means 'school'?", ms: "Perkataan manakah bermaksud school?", a: "sekolah", d: ["pasar", "rumah", "taman"] },
    { en: "Which is a colour (warna)?", ms: "Manakah sejenis warna?", a: "merah", d: ["lari", "tinggi", "cepat"] },
    { en: "Which word means 'eye'?", ms: "Perkataan manakah bermaksud eye?", a: "mata", d: ["kaki", "tangan", "telinga"] },
    { en: "Which is a vehicle (kenderaan)?", ms: "Manakah sejenis kenderaan?", a: "kereta", d: ["epal", "baju", "pokok"] },
    { en: "Which word means 'sun'?", ms: "Perkataan manakah bermaksud sun?", a: "matahari", d: ["bulan", "bintang", "awan"] },
    { en: "Which is a body part?", ms: "Manakah anggota badan?", a: "tangan", d: ["meja", "kereta", "rumah"] },
  ],
  "bm:synonym": [
    { en: "Synonym of 'pandai'?", ms: "Sinonim bagi 'pandai'?", a: "bijak", d: ["malas", "sedih", "lambat"] },
    { en: "Synonym of 'cantik'?", ms: "Sinonim bagi 'cantik'?", a: "indah", d: ["buruk", "kotor", "lama"] },
    { en: "Synonym of 'gembira'?", ms: "Sinonim bagi 'gembira'?", a: "riang", d: ["sedih", "marah", "takut"] },
    { en: "Synonym of 'rajin'?", ms: "Sinonim bagi 'rajin'?", a: "tekun", d: ["malas", "lambat", "lemah"] },
    { en: "Synonym of 'besar'?", ms: "Sinonim bagi 'besar'?", a: "gergasi", d: ["kecil", "halus", "nipis"] },
    { en: "Synonym of 'rumah'?", ms: "Sinonim bagi 'rumah'?", a: "kediaman", d: ["sekolah", "kedai", "padang"] },
    { en: "Synonym of 'usaha'?", ms: "Sinonim bagi 'usaha'?", a: "ikhtiar", d: ["rehat", "tidur", "main"] },
    { en: "Synonym of 'kuat'?", ms: "Sinonim bagi 'kuat'?", a: "gagah", d: ["lemah", "letih", "sakit"] },
  ],
  "bm:antonym": [
    { en: "Antonym of 'besar'?", ms: "Lawan bagi 'besar'?", a: "kecil", d: ["tinggi", "panjang", "lebar"] },
    { en: "Antonym of 'panas'?", ms: "Lawan bagi 'panas'?", a: "sejuk", d: ["manis", "tinggi", "cepat"] },
    { en: "Antonym of 'tinggi'?", ms: "Lawan bagi 'tinggi'?", a: "rendah", d: ["lebar", "berat", "jauh"] },
    { en: "Antonym of 'siang'?", ms: "Lawan bagi 'siang'?", a: "malam", d: ["pagi", "petang", "tengah hari"] },
    { en: "Antonym of 'gembira'?", ms: "Lawan bagi 'gembira'?", a: "sedih", d: ["riang", "suka", "ceria"] },
    { en: "Antonym of 'cepat'?", ms: "Lawan bagi 'cepat'?", a: "lambat", d: ["laju", "pantas", "deras"] },
    { en: "Antonym of 'tua'?", ms: "Lawan bagi 'tua'?", a: "muda", d: ["lama", "besar", "berat"] },
    { en: "Antonym of 'rajin'?", ms: "Lawan bagi 'rajin'?", a: "malas", d: ["tekun", "pandai", "baik"] },
  ],
  "bm:penjodoh": [
    { en: "se___ kereta", ms: "se___ kereta", a: "buah", d: ["ekor", "orang", "helai"] },
    { en: "se___ kucing", ms: "se___ kucing", a: "ekor", d: ["buah", "helai", "biji"] },
    { en: "se___ guru", ms: "se___ guru", a: "orang", d: ["ekor", "biji", "buah"] },
    { en: "se___ kertas", ms: "se___ kertas", a: "helai", d: ["buah", "ekor", "biji"] },
    { en: "se___ telur", ms: "se___ telur", a: "biji", d: ["helai", "orang", "batang"] },
    { en: "se___ pen", ms: "se___ pen", a: "batang", d: ["biji", "ekor", "helai"] },
    { en: "se___ rumah", ms: "se___ rumah", a: "buah", d: ["ekor", "helai", "orang"] },
    { en: "se___ pisang", ms: "se___ pisang", a: "sisir", d: ["ekor", "orang", "batang"] },
  ],
  "bm:imbuhan": [
    { en: "Add 'me-' to 'baca'.", ms: "Tambah 'me-' pada 'baca'.", a: "membaca", d: ["mebaca", "berbaca", "dibaca"] },
    { en: "Add 'ber-' to 'lari'.", ms: "Tambah 'ber-' pada 'lari'.", a: "berlari", d: ["melari", "berlarian", "dilari"] },
    { en: "Add 'me-' to 'tulis'.", ms: "Tambah 'me-' pada 'tulis'.", a: "menulis", d: ["metulis", "bertulis", "ditulis"] },
    { en: "Add 'me-' to 'masak'.", ms: "Tambah 'me-' pada 'masak'.", a: "memasak", d: ["bermasak", "memmasak", "dimasak"] },
    { en: "Add 'me-' to 'tolong'.", ms: "Tambah 'me-' pada 'tolong'.", a: "menolong", d: ["metolong", "bertolong", "ditolong"] },
    { en: "Add 'ber-' to 'main'.", ms: "Tambah 'ber-' pada 'main'.", a: "bermain", d: ["memain", "bermainan", "dimain"] },
  ],
  "bm:peribahasa": [
    { en: "'Bagai aur dengan tebing' means?", ms: "'Bagai aur dengan tebing' bermaksud?", a: "saling membantu", d: ["bermusuhan", "berseorangan", "bertengkar"] },
    { en: "'Berbunga hati' means?", ms: "'Berbunga hati' bermaksud?", a: "sangat gembira", d: ["sangat marah", "sangat letih", "sangat takut"] },
    { en: "'Ringan tulang' means a person who is?", ms: "'Ringan tulang' bermaksud orang yang?", a: "rajin", d: ["malas", "sombong", "kedekut"] },
    { en: "'Buah tangan' means?", ms: "'Buah tangan' bermaksud?", a: "hadiah", d: ["buah-buahan", "tangan", "makanan"] },
    { en: "'Kaki ayam' means?", ms: "'Kaki ayam' bermaksud?", a: "tidak berkasut", d: ["suka makan", "kaki ayam betul", "berlari"] },
    { en: "'Kepala batu' means a person who is?", ms: "'Kepala batu' bermaksud orang yang?", a: "degil", d: ["pandai", "baik hati", "rajin"] },
    { en: "'Membanting tulang' means?", ms: "'Membanting tulang' bermaksud?", a: "bekerja keras", d: ["berehat", "bermain", "tidur"] },
    { en: "Proverb for 'united we stand'?", ms: "Peribahasa untuk bersatu teguh?", a: "Bersatu teguh bercerai roboh", d: ["Ada gula ada semut", "Harapkan pagar", "Bagai pinang dibelah dua"] },
  ],
  "bm:opposites-basic": [
    { en: "What colour is the sun?", ms: "Apakah warna matahari?", a: "kuning", d: ["biru", "hitam", "hijau"] },
    { en: "What colour is grass?", ms: "Apakah warna rumput?", a: "hijau", d: ["merah", "putih", "kuning"] },
    { en: "What colour is the sky?", ms: "Apakah warna langit?", a: "biru", d: ["merah", "hitam", "coklat"] },
    { en: "Opposite of 'buka'?", ms: "Lawan bagi 'buka'?", a: "tutup", d: ["tarik", "tolak", "angkat"] },
    { en: "Opposite of 'naik'?", ms: "Lawan bagi 'naik'?", a: "turun", d: ["lari", "duduk", "jalan"] },
  ],
  "bm:suku-kata": [
    { en: "Join: 'bu' + 'ku' = ?", ms: "Cantum: 'bu' + 'ku' = ?", a: "buku", d: ["kubu", "baku", "kuku"] },
    { en: "Join: 'me' + 'ja' = ?", ms: "Cantum: 'me' + 'ja' = ?", a: "meja", d: ["jame", "maja", "jema"] },
    { en: "Join: 'ka' + 'ki' = ?", ms: "Cantum: 'ka' + 'ki' = ?", a: "kaki", d: ["kika", "kuku", "kiki"] },
    { en: "Join: 'ba' + 'ju' = ?", ms: "Cantum: 'ba' + 'ju' = ?", a: "baju", d: ["juba", "buja", "jaba"] },
    { en: "Join: 'ro' + 'ti' = ?", ms: "Cantum: 'ro' + 'ti' = ?", a: "roti", d: ["tiro", "rota", "tori"] },
  ],
  "en:vocabulary": [
    { en: "A baby dog is a ___", ms: "Anak anjing ialah ___", a: "puppy", d: ["kitten", "calf", "chick"] },
    { en: "A baby cat is a ___", ms: "Anak kucing ialah ___", a: "kitten", d: ["puppy", "cub", "foal"] },
    { en: "Which animal can fly?", ms: "Haiwan manakah boleh terbang?", a: "bird", d: ["fish", "cow", "dog"] },
    { en: "Which lives in water?", ms: "Manakah hidup dalam air?", a: "fish", d: ["cat", "bird", "horse"] },
    { en: "We write with a ___", ms: "Kita menulis dengan ___", a: "pencil", d: ["spoon", "shoe", "cup"] },
    { en: "A doctor works in a ___", ms: "Doktor bekerja di ___", a: "hospital", d: ["kitchen", "garage", "garden"] },
    { en: "A person who teaches is a ___", ms: "Orang yang mengajar ialah ___", a: "teacher", d: ["farmer", "pilot", "chef"] },
    { en: "A person who flies a plane is a ___", ms: "Orang yang menerbangkan kapal terbang ialah ___", a: "pilot", d: ["sailor", "driver", "doctor"] },
    { en: "A place with many books is a ___", ms: "Tempat banyak buku ialah ___", a: "library", d: ["bakery", "stadium", "factory"] },
    { en: "What colour is a banana?", ms: "Apakah warna pisang?", a: "yellow", d: ["blue", "black", "purple"] },
    { en: "Which one do you wear?", ms: "Manakah anda pakai?", a: "shoes", d: ["table", "apple", "spoon"] },
    { en: "A person who studies stars is an ___", ms: "Orang yang mengkaji bintang ialah ___", a: "astronomer", d: ["author", "athlete", "artist"] },
  ],
  "en:synonym": [
    { en: "Synonym of 'big'?", ms: "Sinonim bagi 'big'?", a: "large", d: ["tiny", "short", "thin"] },
    { en: "Synonym of 'happy'?", ms: "Sinonim bagi 'happy'?", a: "glad", d: ["sad", "angry", "tired"] },
    { en: "Synonym of 'fast'?", ms: "Sinonim bagi 'fast'?", a: "quick", d: ["slow", "late", "lazy"] },
    { en: "Synonym of 'brave'?", ms: "Sinonim bagi 'brave'?", a: "courageous", d: ["scared", "weak", "shy"] },
    { en: "Synonym of 'difficult'?", ms: "Sinonim bagi 'difficult'?", a: "hard", d: ["easy", "simple", "light"] },
    { en: "Synonym of 'enormous'?", ms: "Sinonim bagi 'enormous'?", a: "huge", d: ["tiny", "narrow", "small"] },
    { en: "Synonym of 'smart'?", ms: "Sinonim bagi 'smart'?", a: "clever", d: ["silly", "slow", "weak"] },
    { en: "Synonym of 'pretty'?", ms: "Sinonim bagi 'pretty'?", a: "beautiful", d: ["ugly", "dirty", "old"] },
  ],
  "en:antonym": [
    { en: "Antonym of 'happy'?", ms: "Antonim bagi 'happy'?", a: "sad", d: ["glad", "joyful", "merry"] },
    { en: "Antonym of 'big'?", ms: "Antonim bagi 'big'?", a: "small", d: ["huge", "large", "wide"] },
    { en: "Antonym of 'fast'?", ms: "Antonim bagi 'fast'?", a: "slow", d: ["quick", "rapid", "speedy"] },
    { en: "Antonym of 'hot'?", ms: "Antonim bagi 'hot'?", a: "cold", d: ["warm", "sunny", "dry"] },
    { en: "Antonym of 'ancient'?", ms: "Antonim bagi 'ancient'?", a: "modern", d: ["old", "past", "historic"] },
    { en: "Antonym of 'generous'?", ms: "Antonim bagi 'generous'?", a: "stingy", d: ["kind", "giving", "caring"] },
    { en: "Antonym of 'expand'?", ms: "Antonim bagi 'expand'?", a: "shrink", d: ["grow", "widen", "stretch"] },
    { en: "Antonym of 'day'?", ms: "Antonim bagi 'day'?", a: "night", d: ["noon", "morning", "evening"] },
  ],
  "en:plural": [
    { en: "Plural of 'cat'?", ms: "Jamak bagi 'cat'?", a: "cats", d: ["cates", "cat", "caties"] },
    { en: "Plural of 'box'?", ms: "Jamak bagi 'box'?", a: "boxes", d: ["boxs", "boxies", "box"] },
    { en: "Plural of 'baby'?", ms: "Jamak bagi 'baby'?", a: "babies", d: ["babys", "babyes", "baby"] },
    { en: "Plural of 'bus'?", ms: "Jamak bagi 'bus'?", a: "buses", d: ["buss", "busies", "bus"] },
    { en: "Plural of 'leaf'?", ms: "Jamak bagi 'leaf'?", a: "leaves", d: ["leafs", "leafes", "leaf"] },
    { en: "Plural of 'mouse'?", ms: "Jamak bagi 'mouse'?", a: "mice", d: ["mouses", "mouse", "mices"] },
  ],
  "en:past-tense": [
    { en: "Past tense of 'play'?", ms: "Kata lampau bagi 'play'?", a: "played", d: ["plaid", "playing", "plays"] },
    { en: "Past tense of 'go'?", ms: "Kata lampau bagi 'go'?", a: "went", d: ["goed", "gone", "going"] },
    { en: "Past tense of 'eat'?", ms: "Kata lampau bagi 'eat'?", a: "ate", d: ["eated", "eaten", "eating"] },
    { en: "Past tense of 'run'?", ms: "Kata lampau bagi 'run'?", a: "ran", d: ["runned", "running", "runs"] },
    { en: "Past tense of 'write'?", ms: "Kata lampau bagi 'write'?", a: "wrote", d: ["writed", "written", "writing"] },
    { en: "Past tense of 'see'?", ms: "Kata lampau bagi 'see'?", a: "saw", d: ["seed", "seen", "sawed"] },
  ],
  "en:preposition": [
    { en: "The book is ___ the table (top).", ms: "The book is ___ the table.", a: "on", d: ["under", "in", "between"] },
    { en: "The ball is ___ the box (inside).", ms: "The ball is ___ the box.", a: "in", d: ["on", "under", "above"] },
    { en: "The cat hides ___ the bed (below).", ms: "The cat hides ___ the bed.", a: "under", d: ["on", "in", "over"] },
    { en: "The shoes are ___ the door (beside).", ms: "The shoes are ___ the door.", a: "next to", d: ["in", "under", "inside"] },
    { en: "The bird flew ___ the tree (over).", ms: "The bird flew ___ the tree.", a: "above", d: ["under", "in", "inside"] },
  ],
  "en:grammar": [
    { en: "He ___ to school daily.", ms: "He ___ to school daily.", a: "walks", d: ["walk", "walking", "walked"] },
    { en: "They ___ football now.", ms: "They ___ football now.", a: "play", d: ["plays", "playing", "played"] },
    { en: "She has ___ her homework.", ms: "She has ___ her homework.", a: "finished", d: ["finish", "finishing", "finishes"] },
    { en: "Pick the correct sentence.", ms: "Pilih ayat betul.", a: "They are playing.", d: ["They is playing.", "They am play.", "They plays."] },
    { en: "She is the ___ runner of all.", ms: "She is the ___ runner of all.", a: "fastest", d: ["faster", "most fast", "fast"] },
    { en: "Which is passive?", ms: "Manakah ayat pasif?", a: "The cake was eaten.", d: ["She ate cake.", "She eats cake.", "She is eating."] },
  ],
  "en:adjective": [
    { en: "Pick the adjective.", ms: "Pilih kata adjektif.", a: "beautiful", d: ["run", "table", "quickly"] },
    { en: "Ice cream tastes ___.", ms: "Ice cream tastes ___.", a: "sweet", d: ["loud", "fast", "tall"] },
    { en: "The elephant is very ___.", ms: "The elephant is very ___.", a: "big", d: ["run", "eat", "jump"] },
    { en: "Pick the adjective.", ms: "Pilih kata adjektif.", a: "happy", d: ["jump", "chair", "slowly"] },
  ],
};

const MECH_BY_SKILL: Record<string, ChallengeMechanic> = {
  "bm:suku-kata": "build",
  "bm:imbuhan": "build",
  "bm:penjodoh": "lane-select",
  "bm:vocabulary": "lane-select",
  "en:vocabulary": "lane-select",
  "en:preposition": "lane-select",
  "en:adjective": "lane-select",
};

function genLanguage(subject: SubjectId, skill: string, year: Year): GenQ | null {
  const bankKey = `${subject === "bm" ? "bm" : "en"}:${skill}`;
  const bank = BANKS[bankKey];
  if (!bank || bank.length === 0) return null;
  const it = pick(bank);
  const mech = MECH_BY_SKILL[bankKey] ?? pick(MECH);
  const d = diffByYear(year);
  return mc(subject, year, skill, mech, d, it.en, it.ms, it.a, it.d, "Think carefully — you can do it!", "Fikir dengan teliti — anda boleh!");
}

const MATH_SKILLS = new Set([
  "counting", "addition", "subtraction", "multiplication", "division", "compare",
  "skip-counting", "money", "fraction-of", "percentage", "decimals", "word-problem", "rounding",
]);

export function isGeneratable(subject: SubjectId, skill: string): boolean {
  if (subject === "math") return MATH_SKILLS.has(skill);
  const key = `${subject === "bm" ? "bm" : "en"}:${skill}`;
  return !!BANKS[key];
}

/**
 * Generate `count` fresh challenges for a (subject, skill, year), de-duplicated
 * by prompt where possible. Always returns at least one challenge.
 */
export function generate(topicId: string, subject: SubjectId, skill: string, year: Year, count: number): Challenge[] {
  const out: Challenge[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 8) {
    guard++;
    const q = subject === "math" ? genMath(skill, year) : genLanguage(subject, skill, year);
    if (!q) break;
    const key = q.prompt.en + "|" + q.options.map((o) => o.label).join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...q, id: `${topicId}-g${out.length}-${Math.random().toString(36).slice(2, 7)}`, topicId });
  }
  if (out.length === 0) {
    // Guaranteed fallback so a topic is never empty.
    const q = genMath("addition", year);
    out.push({ ...q, id: `${topicId}-g0`, topicId, subject });
  }
  return out;
}
