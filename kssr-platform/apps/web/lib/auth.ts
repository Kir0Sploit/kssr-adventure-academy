import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "kssr_session";
const SESSION_DAYS = 30;

/** scrypt password hash in the form "salt:hash" (no native deps). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(accountId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await prisma.session.create({ data: { token, accountId, expiresAt } });
  return { token, expiresAt };
}

export function setSessionCookie(res: NextResponse, token: string, expiresAt: Date): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure only when explicitly enabled (e.g. behind HTTPS). Allows local
    // http:// offline use; set COOKIE_SECURE=true in production behind TLS.
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export interface SessionAccount {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: string;
}

/** Resolve the logged-in account from the request's session cookie, or null. */
export async function accountFromRequest(req: NextRequest): Promise<SessionAccount | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token }, include: { account: true } });
  if (!session || session.expiresAt < new Date()) return null;
  const a = session.account;
  return { id: a.id, email: a.email, name: a.name, plan: a.plan, role: a.role };
}

/** Returns the account only if it is an admin, else null. */
export async function adminFromRequest(req: NextRequest): Promise<SessionAccount | null> {
  const a = await accountFromRequest(req);
  return a && a.role === "admin" ? a : null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
