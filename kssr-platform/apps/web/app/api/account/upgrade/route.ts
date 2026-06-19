import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { accountFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Interim "redeem code" upgrade until the payment gateway is connected.
// Give this code to buyers manually; set BUNDLE_ACCESS_CODE in production.
const CODE = process.env.BUNDLE_ACCESS_CODE || "KSSR-BUNDLE-2026";

export async function POST(req: NextRequest): Promise<Response> {
  const account = await accountFromRequest(req);
  if (!account) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const { code } = (await req.json()) as { code?: string };
    if ((code || "").trim().toUpperCase() !== CODE.toUpperCase()) {
      return NextResponse.json({ ok: false, error: "Kod tidak sah" }, { status: 400 });
    }
    await prisma.account.update({ where: { id: account.id }, data: { plan: "bundle" } });
    return NextResponse.json({ ok: true, plan: "bundle" });
  } catch {
    return NextResponse.json({ ok: false, error: "Ralat pelayan" }, { status: 500 });
  }
}
