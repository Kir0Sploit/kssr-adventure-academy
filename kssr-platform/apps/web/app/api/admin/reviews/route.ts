import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, reviews });
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const b = (await req.json()) as { name?: string; place?: string; text?: string; rating?: number; photoUrl?: string; published?: boolean };
  if (!b.name || !b.text) return NextResponse.json({ ok: false, error: "Nama & ulasan diperlukan" }, { status: 400 });
  const review = await prisma.review.create({
    data: {
      name: b.name.slice(0, 60),
      place: b.place?.slice(0, 80) || null,
      text: b.text.slice(0, 400),
      rating: Math.max(1, Math.min(5, Number(b.rating) || 5)),
      photoUrl: b.photoUrl?.slice(0, 300) || null,
      published: b.published !== false,
    },
  });
  return NextResponse.json({ ok: true, review });
}

export async function DELETE(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
