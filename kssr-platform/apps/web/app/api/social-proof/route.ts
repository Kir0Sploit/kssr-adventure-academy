import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Redact a consented row to its chosen privacy mode (PDPA-safe). */
function redact(e: {
  type: string;
  customerName: string | null;
  state: string | null;
  packageName: string | null;
  detail: string | null;
  childYear: number | null;
  displayMode: string;
}): string | null {
  const parts = e.customerName?.trim().split(/\s+/) ?? [];
  const first = parts[0] ?? null;
  const initial = parts[1]?.[0];
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
    default:
      who = first ? `${first}${initial ? " " + initial + "." : ""}` : "Seorang ibu bapa";
  }
  if (e.type === "purchase") return `${who} baru menyertai ${e.packageName ?? "pakej pembelajaran"}`;
  if (e.type === "registration") return e.childYear ? `${who} baru mendaftar anak Tahun ${e.childYear}` : `${who} baru menyertai`;
  if (e.type === "achievement") return `${who} ${e.detail ?? "membuka pencapaian baharu"}`;
  return null;
}

export async function GET(): Promise<Response> {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const dayAgo = new Date(Date.now() - 86400000);

  let events: Array<{ id: string; type: string; text: string; createdAt: string }> = [];
  let gamesThisWeek = 0;
  let gamesToday = 0;
  let perfectThisWeek = 0;

  try {
    const rows = await prisma.socialProofEvent.findMany({
      where: { consentToDisplay: true, displayMode: { not: "hidden" }, createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    events = rows
      .map((r) => ({ id: r.id, type: r.type, text: redact(r), createdAt: r.createdAt.toISOString() }))
      .filter((e): e is { id: string; type: string; text: string; createdAt: string } => !!e.text);

    // Real analytics fallback — computed, never fabricated.
    [gamesThisWeek, gamesToday, perfectThisWeek] = await Promise.all([
      prisma.playEvent.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.playEvent.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.playEvent.count({ where: { createdAt: { gte: weekAgo } } }), // placeholder; refined below
    ]);
    perfectThisWeek = await prisma.playEvent.count({ where: { createdAt: { gte: weekAgo }, correct: { gt: 0 } } });
  } catch {
    // DB not migrated yet — return empty/zero rather than anything fake.
  }

  return NextResponse.json(
    { events, stats: { gamesThisWeek, gamesToday, perfectThisWeek } },
    { headers: { "cache-control": "no-store" } },
  );
}
