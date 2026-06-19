import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const users = await prisma.account.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, email: true, name: true, plan: true, role: true, createdAt: true, _count: { select: { children: true } } },
  });
  return NextResponse.json({ ok: true, users });
}

export async function PATCH(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const { id, plan } = (await req.json()) as { id?: string; plan?: string };
  if (!id || (plan !== "free" && plan !== "bundle")) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.account.update({ where: { id }, data: { plan } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest): Promise<Response> {
  const admin = await adminFromRequest(req);
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = (await req.json()) as { id?: string };
  if (!id || id === admin.id) return NextResponse.json({ ok: false, error: "Tidak boleh padam diri sendiri" }, { status: 400 });
  await prisma.account.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
