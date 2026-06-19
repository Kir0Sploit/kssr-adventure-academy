import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email || !password) return NextResponse.json({ ok: false, error: "E-mel & kata laluan diperlukan" }, { status: 400 });

    const account = await prisma.account.findUnique({ where: { email: email.toLowerCase() } });
    if (!account || !verifyPassword(password, account.passwordHash)) {
      return NextResponse.json({ ok: false, error: "E-mel atau kata laluan salah" }, { status: 401 });
    }
    const { token, expiresAt } = await createSession(account.id);
    const res = NextResponse.json({ ok: true, account: { id: account.id, email: account.email, name: account.name } });
    setSessionCookie(res, token, expiresAt);
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Ralat pelayan" }, { status: 500 });
  }
}
