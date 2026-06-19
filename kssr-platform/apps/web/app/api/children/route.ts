import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { accountFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const account = await accountFromRequest(req);
  if (!account) return NextResponse.json({ ok: false }, { status: 401 });
  const children = await prisma.childProfile.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, avatar: true, year: true, progress: true },
  });
  return NextResponse.json({ ok: true, children });
}

export async function POST(req: NextRequest): Promise<Response> {
  const account = await accountFromRequest(req);
  if (!account) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const { name, avatar, year } = (await req.json()) as { name?: string; avatar?: string; year?: number };
    if (!name) return NextResponse.json({ ok: false, error: "Nama diperlukan" }, { status: 400 });
    const count = await prisma.childProfile.count({ where: { accountId: account.id } });
    const maxProfiles = account.plan === "bundle" ? 4 : 1;
    if (count >= maxProfiles) {
      return NextResponse.json(
        { ok: false, error: account.plan === "bundle" ? "Had 4 profil dicapai" : "Versi percuma hanya 1 profil. Naik taraf untuk 4 profil." },
        { status: 400 },
      );
    }
    const child = await prisma.childProfile.create({
      data: {
        accountId: account.id,
        name: name.slice(0, 20),
        avatar: (avatar || "🦸").slice(0, 8),
        year: Math.max(1, Math.min(6, Number(year) || 1)),
      },
      select: { id: true, name: true, avatar: true, year: true, progress: true },
    });
    return NextResponse.json({ ok: true, child });
  } catch {
    return NextResponse.json({ ok: false, error: "Ralat pelayan" }, { status: 500 });
  }
}
