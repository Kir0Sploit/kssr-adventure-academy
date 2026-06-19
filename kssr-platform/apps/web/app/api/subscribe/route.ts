import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** PDPA-compliant email lead capture (explicit opt-in required). */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { email, consent } = (await req.json()) as { email?: string; consent?: boolean };
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "E-mel tidak sah" }, { status: 400 });
    }
    if (consent !== true) {
      return NextResponse.json({ ok: false, error: "Persetujuan diperlukan" }, { status: 400 });
    }
    await prisma.subscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { consent: true },
      create: { email: email.toLowerCase(), consent: true },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Ralat pelayan" }, { status: 500 });
  }
}
