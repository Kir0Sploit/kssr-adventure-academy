import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [accounts, bundles, children, subscribers, reviews, customQ, playsWeek, plays] = await Promise.all([
    prisma.account.count(),
    prisma.account.count({ where: { plan: "bundle" } }),
    prisma.childProfile.count(),
    prisma.subscriber.count(),
    prisma.review.count(),
    prisma.customChallenge.count(),
    prisma.playEvent.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.playEvent.count(),
  ]);
  return NextResponse.json({ ok: true, stats: { accounts, bundles, children, subscribers, reviews, customQ, playsWeek, plays } });
}
