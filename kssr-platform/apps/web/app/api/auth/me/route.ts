import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { accountFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const account = await accountFromRequest(req);
  if (!account) return NextResponse.json({ ok: false, account: null }, { status: 200 });
  const children = await prisma.childProfile.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, avatar: true, year: true, progress: true },
  });
  return NextResponse.json({ ok: true, account: { id: account.id, email: account.email, name: account.name, plan: account.plan, role: account.role }, children });
}
