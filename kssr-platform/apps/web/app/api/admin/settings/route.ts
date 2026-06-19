import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

const KEYS = ["promoEndsAt"] as const;

/** Admin: read all known settings as a flat map. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const rows = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json({ ok: true, settings });
}

/** Admin: upsert one or more settings. */
export async function PUT(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const body = (await req.json()) as Record<string, unknown>;
  const updates = Object.entries(body).filter(([k]) => (KEYS as readonly string[]).includes(k));
  for (const [key, raw] of updates) {
    const value = String(raw ?? "");
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return NextResponse.json({ ok: true });
}
