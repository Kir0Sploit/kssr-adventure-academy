import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, hashPassword, isValidEmail, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { email, password, name } = (await req.json()) as { email?: string; password?: string; name?: string };
    if (!email || !isValidEmail(email)) return NextResponse.json({ ok: false, error: "E-mel tidak sah" }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ ok: false, error: "Kata laluan minimum 6 aksara" }, { status: 400 });

    const existing = await prisma.account.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return NextResponse.json({ ok: false, error: "E-mel sudah didaftar" }, { status: 409 });

    const account = await prisma.account.create({
      data: { email: email.toLowerCase(), name: (name || "Ibu/Bapa").slice(0, 40), passwordHash: hashPassword(password) },
    });
    const { token, expiresAt } = await createSession(account.id);
    const res = NextResponse.json({ ok: true, account: { id: account.id, email: account.email, name: account.name } });
    setSessionCookie(res, token, expiresAt);
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Ralat pelayan" }, { status: 500 });
  }
}
