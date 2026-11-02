"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { buttonLg, buttonPrimary, card, fieldInput, fieldLabel } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        setError(
          typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
            ? body.error
            : "เข้าสู่ระบบไม่สำเร็จ",
        );
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`${card} flex flex-col gap-5 p-6 shadow-raised`}>
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
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      <button type="submit" disabled={submitting} className={`${buttonPrimary} ${buttonLg}`}>
        {submitting ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
