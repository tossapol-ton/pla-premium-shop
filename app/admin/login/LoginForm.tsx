"use client";

import { useActionState } from "react";
import { buttonLg, buttonPrimary, card, fieldInput, fieldLabel } from "@/components/ui";
import { loginAction, type LoginState } from "@/lib/admin-actions";

const INITIAL: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const error = state.error;

  return (
    <form action={formAction} className={`${card} flex flex-col gap-5 p-6 shadow-raised`}>
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.14em] text-navy-600 uppercase">
          <span aria-hidden="true" className="h-0.5 w-6 bg-orange-500" />
          Admin
        </span>
        <h1 className="m-0 text-2xl font-bold text-navy-900">เข้าสู่ระบบ Admin</h1>
        <p className="m-0 text-sm text-muted">สำหรับเจ้าหน้าที่จัดการสินค้าและคำสั่งซื้อ</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-password" className={fieldLabel}>
          รหัสผ่าน
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "admin-password-error" : undefined}
          className={fieldInput}
        />
        {error && (
          <span id="admin-password-error" role="alert" className="text-[13px] text-danger">
            {error}
          </span>
        )}
      </div>
      <button type="submit" disabled={pending} className={`${buttonPrimary} ${buttonLg}`}>
        {pending ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
