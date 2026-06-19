"use client";
/**
 * Social-proof feed (client).
 *
 * HONESTY RULES (enforced in code):
 *  - We never fabricate third-party activity.
 *  - In the current static app there are no purchases/registrations and no
 *    cross-user database, so the only real data is the player's OWN actions.
 *    Those are surfaced as encouraging self-progress toasts ("Anda ...").
 *  - Named customer notifications ("Farhan A. dari Selangor ...") come only
 *    from the live API (`/api/social-proof`), which emits consented, redacted
 *    rows. `setEndpoint()` switches to that source automatically once it exists.
 */

export interface SocialItem {
  id: string;
  text: string;
  icon: string;
}

type Listener = (item: SocialItem) => void;
const listeners = new Set<Listener>();

/** Push a REAL event (the player's own action) into the live feed. */
export function pushSocialEvent(item: Omit<SocialItem, "id"> & { id?: string }): void {
  const full: SocialItem = { id: item.id ?? `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: item.text, icon: item.icon };
  listeners.forEach((l) => l(full));
}

export function subscribeSocial(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/* ---------- Live API source (used only when an endpoint is configured) ---------- */
let endpoint: string | null = null;
export function setSocialEndpoint(url: string | null): void {
  endpoint = url;
}

export interface SocialProofPayload {
  events: Array<{ id: string; type: string; text: string; createdAt: string }>;
  stats: { gamesThisWeek: number; gamesToday: number; perfectThisWeek: number };
}

/** Fetch consented, server-redacted events + real analytics (live phase). */
export async function fetchSocialProof(): Promise<SocialProofPayload | null> {
  if (!endpoint) return null;
  try {
    const r = await fetch(endpoint, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as SocialProofPayload;
  } catch {
    return null;
  }
}

/** Records a real, anonymous gameplay completion to the backend (if present). */
export function recordPlayEvent(data: { subject: string; topicId: string; year: number; correct: number; total: number }): void {
  try {
    void fetch("/api/play-event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    });
  } catch {
    /* offline / no backend — ignore */
  }
}

const ICON_FOR: Record<string, string> = { purchase: "🎉", registration: "🙋", achievement: "🏅" };
export function iconForType(type: string): string {
  return ICON_FOR[type] ?? "✨";
}
