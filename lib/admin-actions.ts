"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
  sessionCookieOptions,
} from "@/lib/admin-auth";

// Server Actions for the admin login form. Setting the cookie inside a Server
// Action and redirecting from it lets Next.js return the fresh /admin page in
// the same round trip, so a redirect cached by an earlier (signed-out)
// prefetch cannot bounce the user back to the login page.

export type LoginState = { error: string | null };

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "ยังไม่ได้ตั้งค่ารหัสผ่าน Admin (ADMIN_PASSWORD)" };
  }
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "กรุณากรอกรหัสผ่าน" };
  }
  if (!checkPassword(password)) {
    return { error: "รหัสผ่านไม่ถูกต้อง" };
  }
  const { token, maxAge } = createSessionToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, { ...sessionCookieOptions, maxAge });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  redirect("/admin/login");
}
