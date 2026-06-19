"use client";
/** Client helpers for parent accounts + child profiles (same-origin API). */

export interface AccountDTO {
  id: string;
  email: string;
  name: string;
}
export interface ChildDTO {
  id: string;
  name: string;
  avatar: string;
  year: number;
  progress: string; // JSON string
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return (await r.json()) as T;
}

export async function getMe(): Promise<{ ok: boolean; account: AccountDTO | null; children?: ChildDTO[] }> {
  try {
    const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
    return (await r.json()) as { ok: boolean; account: AccountDTO | null; children?: ChildDTO[] };
  } catch {
    return { ok: false, account: null };
  }
}

export function register(email: string, password: string, name: string) {
  return post<{ ok: boolean; account?: AccountDTO; error?: string }>("/api/auth/register", { email, password, name });
}
export function login(email: string, password: string) {
  return post<{ ok: boolean; account?: AccountDTO; error?: string }>("/api/auth/login", { email, password });
}
export function logout() {
  return post<{ ok: boolean }>("/api/auth/logout", {});
}
export function addChild(name: string, avatar: string, year: number) {
  return post<{ ok: boolean; child?: ChildDTO; error?: string }>("/api/children", { name, avatar, year });
}
export async function saveChildProgress(childId: string, progress: unknown, year: number): Promise<void> {
  try {
    await fetch(`/api/children/${childId}/progress`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({ progress, year }),
    });
  } catch {
    /* offline — ignore */
  }
}
