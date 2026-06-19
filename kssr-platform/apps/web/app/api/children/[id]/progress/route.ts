import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { accountFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Persist a child's progress snapshot (owner-checked). */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  const account = await accountFromRequest(req);
  if (!account) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await ctx.params;
  const child = await prisma.childProfile.findUnique({ where: { id } });
  if (!child || child.accountId !== account.id) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    const body = (await req.json()) as { progress?: unknown; year?: number };
    const progress = JSON.stringify(body.progress ?? {}).slice(0, 20000);
    await prisma.childProfile.update({
      where: { id },
      data: { progress, ...(body.year ? { year: Math.max(1, Math.min(6, Number(body.year))) } : {}) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
