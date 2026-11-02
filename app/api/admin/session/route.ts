import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, readJson } from "@/lib/api";
import {
  ADMIN_COOKIE,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
  sessionCookieOptions,
} from "@/lib/admin-auth";

const loginSchema = z.object({ password: z.string().min(1).max(200) }).strict();

// POST /api/admin/session — log in with the admin password
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return jsonError(503, "ยังไม่ได้ตั้งค่ารหัสผ่าน Admin (ADMIN_PASSWORD)");
  }
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success || !checkPassword(parsed.data.password)) {
    return jsonError(401, "รหัสผ่านไม่ถูกต้อง");
  }
  const { token, maxAge } = createSessionToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, { ...sessionCookieOptions, maxAge });
  return new NextResponse(null, { status: 204 });
}

// DELETE /api/admin/session — log out
export async function DELETE() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return new NextResponse(null, { status: 204 });
}
