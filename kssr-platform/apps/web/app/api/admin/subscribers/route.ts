import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return NextResponse.json({ ok: true, subscribers });
}
