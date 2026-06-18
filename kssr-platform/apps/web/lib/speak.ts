"use client";
/** Reads text aloud using the Web Speech API (helps pre-readers). */
import type { Locale } from "@kssr/shared";

export function speak(text: string, locale: Locale): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale === "ms" ? "ms-MY" : "en-US";
    u.rate = 0.95;
    u.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* speech not available — silent fallback */
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
