import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Admin: list bundle (paid) accounts — interim payments view until a gateway. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const accounts = await prisma.account.findMany({
    where: { plan: "bundle" },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, accounts });
}

/** Admin: grant or revoke the bundle plan by email (manual payment fulfilment). */
export async function POST(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const { email, plan } = (await req.json()) as { email?: string; plan?: string };
  if (!email || (plan !== "free" && plan !== "bundle")) return NextResponse.json({ ok: false, error: "Data tidak sah" }, { status: 400 });
  const account = await prisma.account.findUnique({ where: { email: email.toLowerCase() } });
  if (!account) return NextResponse.json({ ok: false, error: "Akaun tidak dijumpai" }, { status: 404 });
  await prisma.account.update({ where: { id: account.id }, data: { plan } });
  return NextResponse.json({ ok: true });
}
