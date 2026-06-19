import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const items = await prisma.customChallenge.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const b = (await req.json()) as {
    subject?: string; year?: number; topicId?: string;
    promptEn?: string; promptMs?: string;
    options?: { label: string; correct: boolean }[];
  };
  const opts = Array.isArray(b.options) ? b.options.filter((o) => o && o.label) : [];
  if (!b.subject || !b.promptEn || !b.promptMs || opts.length < 2) {
    return NextResponse.json({ ok: false, error: "Lengkapkan soalan & sekurang-kurangnya 2 pilihan" }, { status: 400 });
  }
  if (opts.filter((o) => o.correct).length !== 1) {
    return NextResponse.json({ ok: false, error: "Tepat satu jawapan betul diperlukan" }, { status: 400 });
  }
  const item = await prisma.customChallenge.create({
    data: {
      subject: b.subject,
      year: Math.max(1, Math.min(6, Number(b.year) || 1)),
      topicId: b.topicId || null,
      promptEn: b.promptEn.slice(0, 300),
      promptMs: b.promptMs.slice(0, 300),
      options: JSON.stringify(opts.slice(0, 4).map((o) => ({ label: String(o.label).slice(0, 80), correct: !!o.correct }))),
    },
  });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.customChallenge.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
