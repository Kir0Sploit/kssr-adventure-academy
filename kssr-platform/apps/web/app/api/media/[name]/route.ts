import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
};

/**
 * Public: serve an uploaded image by filename. Files uploaded at runtime are
 * served here (Next's static /public handler only picks up files present at
 * server start), so this guarantees uploads are visible immediately.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ name: string }> }): Promise<Response> {
  const { name } = await ctx.params;
  // Reject path traversal — only a bare filename is allowed.
  if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const buf = await readFile(path.join(UPLOAD_DIR, name));
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    const type = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buf), {
      headers: { "content-type": type, "cache-control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
