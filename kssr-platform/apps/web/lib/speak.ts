"use client";
/**
 * Bilingual text-to-speech (Web Speech API) that works for Malay and English.
 *
 * Device voice support varies: many phones ship an `ms-MY` voice, but some
 * don't. Malay is highly phonetic and shares pronunciation with Indonesian,
 * so we fall back ms-MY -> ms -> id-ID -> id -> any. This lets the engine
 * speak essentially any Malay word reasonably, not just preset phrases.
 */
import type { Locale } from "@kssr/shared";

let voices: SpeechSynthesisVoice[] = [];

function refreshVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const v = window.speechSynthesis.getVoices();
  if (v && v.length) voices = v;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  refreshVoices();
  // Voices often load asynchronously on first use.
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

const PREFERENCES: Record<Locale, string[]> = {
  ms: ["ms-my", "ms", "id-id", "id"],
  en: ["en-us", "en-gb", "en-au", "en"],
};

function pickVoice(locale: Locale): SpeechSynthesisVoice | undefined {
  if (!voices.length) refreshVoices();
  for (const tag of PREFERENCES[locale]) {
    const v = voices.find((vc) => vc.lang?.toLowerCase().replace("_", "-").startsWith(tag));
    if (v) return v;
  }
  // Last resort: any voice whose name hints Malay/Indonesian, else the default.
  return (
    voices.find((vc) => /malay|melayu|indonesia/i.test(vc.name)) ?? voices[0]
  );
}

/** Speaks `text` in the given locale, picking the best available voice. */
export function speak(text: string, locale: Locale): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(locale);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = locale === "ms" ? "ms-MY" : "en-US";
    }
    u.rate = 0.92;
    u.pitch = 1.08;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* speech unavailable — silent fallback */
  }
}

/** Spells a word out loud, letter by letter (great for early literacy). */
export function spell(word: string, locale: Locale): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const letters = word.replace(/[^\p{L}\p{N}]/gu, "").split("");
  if (!letters.length) return;
  try {
    window.speechSynthesis.cancel();
    const voice = pickVoice(locale);
    letters.forEach((ch, i) => {
      const u = new SpeechSynthesisUtterance(ch);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = locale === "ms" ? "ms-MY" : "en-US";
      }
      u.rate = 0.7;
      u.pitch = 1.1;
      // small gap between letters
      setTimeout(() => window.speechSynthesis.speak(u), i * 40);
    });
    // finally say the whole word
    setTimeout(() => speak(word, locale), letters.length * 40 + 120);
  } catch {
    /* noop */
  }
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

/** True if the device appears to have a Malay/Indonesian voice. */
export function hasMalayVoice(): boolean {
  if (!voices.length) refreshVoices();
  return voices.some((v) => /^(ms|id)([-_]|$)/i.test(v.lang ?? "") || /malay|melayu|indonesia/i.test(v.name));
}
