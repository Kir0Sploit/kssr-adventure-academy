import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public: site settings safe to expose to visitors (e.g. promo end time). */
export async function GET(): Promise<Response> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "promoEndsAt" } });
    const promoEndsAt = row ? Number(row.value) : 0;
    return NextResponse.json({ ok: true, promoEndsAt: Number.isFinite(promoEndsAt) ? promoEndsAt : 0 });
  } catch {
    return NextResponse.json({ ok: true, promoEndsAt: 0 });
  }
}
