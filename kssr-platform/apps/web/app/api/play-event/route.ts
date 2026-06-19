import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Records a real, anonymous gameplay completion (no personal data). */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { subject?: string; topicId?: string; year?: number; correct?: number; total?: number };
    if (!body.subject || !body.topicId) {
      return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
    }
    await prisma.playEvent.create({
      data: {
        subject: String(body.subject).slice(0, 20),
        topicId: String(body.topicId).slice(0, 80),
        year: Math.max(1, Math.min(6, Number(body.year) || 1)),
        correct: Math.max(0, Number(body.correct) || 0),
        total: Math.max(0, Number(body.total) || 0),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
