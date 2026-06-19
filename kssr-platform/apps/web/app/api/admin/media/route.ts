import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg",
};

/** Admin: list uploaded media. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ ok: true, media });
}

/** Admin: upload an image (multipart/form-data, field "file"). */
export async function POST(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Tiada fail" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ ok: false, error: "Jenis fail tidak dibenarkan" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Fail terlalu besar (maks 5MB)" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = EXT[file.type] ?? "bin";
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buf);

  const url = `/uploads/${filename}`;
  const media = await prisma.media.create({ data: { filename, url, mimeType: file.type, size: file.size } });
  return NextResponse.json({ ok: true, media });
}

/** Admin: delete an uploaded image (DB row + file on disk). */
export async function DELETE(req: NextRequest): Promise<Response> {
  if (!(await adminFromRequest(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const row = await prisma.media.findUnique({ where: { id } });
  if (row) {
    await unlink(path.join(UPLOAD_DIR, row.filename)).catch(() => {});
    await prisma.media.delete({ where: { id } });
  }
  return NextResponse.json({ ok: true });
}
