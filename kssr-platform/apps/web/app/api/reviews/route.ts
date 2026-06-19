import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public: published reviews for the landing page. */
export async function GET(): Promise<Response> {
  try {
    const reviews = await prisma.review.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, name: true, place: true, text: true, rating: true, photoUrl: true },
    });
    return NextResponse.json({ ok: true, reviews });
  } catch {
    return NextResponse.json({ ok: true, reviews: [] });
  }
}
