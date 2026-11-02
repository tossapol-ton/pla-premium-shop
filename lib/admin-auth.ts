import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * Minimal single-password admin login for the MVP.
 *
 * The session cookie holds `<expiry>.<HMAC-SHA256(expiry)>`, keyed with
 * ADMIN_PASSWORD, so it is stateless and every session ends when the password
 * changes. Replace with real user accounts (e.g. Supabase Auth) before
 * production use.
 */
export const ADMIN_COOKIE = "pla_admin";
const SESSION_SECONDS = 8 * 60 * 60; // 8 hours

function adminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD ?? "";
  return value.length > 0 ? value : null;
}

export function isAdminConfigured(): boolean {
  return adminPassword() !== null;
}

function sign(expiresAt: number, key: string): string {
  return createHmac("sha256", key).update(`pla-admin:${expiresAt}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  // Hash first so lengths always match and timing does not leak the length.
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function checkPassword(input: string): boolean {
  const password = adminPassword();
  return password !== null && safeEqual(input, password);
}

export function createSessionToken(now: number = Date.now()): { token: string; maxAge: number } {
  const password = adminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD is not set");
  const expiresAt = Math.floor(now / 1000) + SESSION_SECONDS;
  return { token: `${expiresAt}.${sign(expiresAt, password)}`, maxAge: SESSION_SECONDS };
}

export function verifySessionToken(token: string | undefined, now: number = Date.now()): boolean {
  const password = adminPassword();
  if (!password || !token) return false;
  const [expiresRaw, signature] = token.split(".");
  const expiresAt = Number(expiresRaw);
  if (!Number.isInteger(expiresAt) || !signature) return false;
  if (expiresAt * 1000 <= now) return false;
  return safeEqual(signature, sign(expiresAt, password));
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

/** For Server Components and Route Handlers. */
export async function isAdminRequest(): Promise<boolean> {
  // Request-time only: the expiry check reads the clock, which must not run during prerender.
  await connection();
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
