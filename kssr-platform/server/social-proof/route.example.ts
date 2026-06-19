/**
 * Reference API for the social-proof system (live/serverful phase).
 *
 * Drop this into the serverful Next.js app as `app/api/social-proof/route.ts`
 * (or adapt for NestJS). It is intentionally NOT placed in the static-export
 * web app, which has no runtime server.
 *
 * GUARANTEES (match the product spec):
 *  - Only rows with consentToDisplay = true are ever emitted.
 *  - Names are redacted to the per-row `displayMode` before leaving the server.
 *  - If there are no consented events, we DO NOT fabricate any. We instead
 *    return real aggregate analytics computed from the database.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SocialProofPayload {
  events: Array<{ id: string; type: string; text: string; createdAt: string }>;
  stats: { gamesPlayedThisWeek: number; badgesThisWeek: number; activeStudentsToday: number };
}

const MS = (s: string | null | undefined) => (s ? s : null);

/** PDPA-safe redaction: never leak more than the row's chosen displayMode. */
function redact(e: {
  type: string;
  customerName: string | null;
  state: string | null;
  packageName: string | null;
  detail: string | null;
  childYear: number | null;
  displayMode: string;
}): string | null {
  const first = e.customerName?.trim().split(/\s+/)[0] ?? null;
  const initial = e.customerName?.trim().split(/\s+/)[1]?.[0];
  let who: string;
  switch (e.displayMode) {
    case "hidden":
      return null;
    case "stateOnly":
      who = e.state ? `Seorang ibu bapa dari ${e.state}` : "Seorang ibu bapa";
      break;
    case "firstName":
      who = first ?? "Seorang ibu bapa";
      break;
    case "firstNameInitial":
    default:
      who = first ? `${first}${initial ? " " + initial + "." : ""}` : "Seorang ibu bapa";
      break;
  }
  switch (e.type) {
    case "purchase":
      return `${who} baru menyertai ${MS(e.packageName) ?? "pakej pembelajaran"}`;
    case "registration":
      return e.childYear ? `${who} baru mendaftar anak Tahun ${e.childYear}` : `${who} baru menyertai`;
    case "achievement":
      return `${who} ${MS(e.detail) ?? "membuka pencapaian baharu"}`;
    default:
      return null;
  }
}

export async function GET(): Promise<Response> {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const dayAgo = new Date(Date.now() - 86400000);

  const rows = await prisma.socialProofEvent.findMany({
    where: { consentToDisplay: true, displayMode: { not: "hidden" }, createdAt: { gte: weekAgo } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const events = rows
    .map((r) => ({ id: r.id, type: r.type, text: redact(r), createdAt: r.createdAt.toISOString() }))
    .filter((e): e is { id: string; type: string; text: string; createdAt: string } => !!e.text);

  // Real analytics fallback — computed, never invented.
  const [gamesPlayedThisWeek, badgesThisWeek, activeStudentsToday] = await Promise.all([
    prisma.learningEvent.count({ where: { type: "topic_completed", ts: { gte: weekAgo } } }),
    prisma.playerAchievement.count({ where: { unlockedAt: { gte: weekAgo } } }),
    prisma.learningEvent.findMany({ where: { ts: { gte: dayAgo } }, distinct: ["playerId"], select: { playerId: true } }).then((a) => a.length),
  ]);

  const payload: SocialProofPayload = {
    events,
    stats: { gamesPlayedThisWeek, badgesThisWeek, activeStudentsToday },
  };
  return new Response(JSON.stringify(payload), { headers: { "content-type": "application/json", "cache-control": "public, max-age=30" } });
}
