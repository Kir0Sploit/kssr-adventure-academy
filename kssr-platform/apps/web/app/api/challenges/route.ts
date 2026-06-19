import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public: admin-authored custom questions, merged into games on the client. */
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const items = await prisma.customChallenge.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    const out = items.map((i) => ({
      id: i.id,
      subject: i.subject,
      year: i.year,
      topicId: i.topicId,
      prompt: { en: i.promptEn, ms: i.promptMs },
      options: JSON.parse(i.options) as { label: string; correct: boolean }[],
    }));
    return NextResponse.json({ ok: true, items: out });
  } catch {
    return NextResponse.json({ ok: true, items: [] });
  }
}
