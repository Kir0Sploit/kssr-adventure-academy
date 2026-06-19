import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { accountFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// One-time bootstrap: promote the logged-in account to admin with a setup code.
// Set ADMIN_SETUP_CODE in production; rotate/remove after first use.
const SETUP = process.env.ADMIN_SETUP_CODE || "MAKE-ME-ADMIN";

export async function POST(req: NextRequest): Promise<Response> {
  const account = await accountFromRequest(req);
  if (!account) return NextResponse.json({ ok: false }, { status: 401 });
  const { code } = (await req.json()) as { code?: string };
  if ((code || "").trim() !== SETUP) return NextResponse.json({ ok: false, error: "Kod tidak sah" }, { status: 400 });
  await prisma.account.update({ where: { id: account.id }, data: { role: "admin" } });
  return NextResponse.json({ ok: true, role: "admin" });
}
