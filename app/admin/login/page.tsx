import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { LoginForm } from "@/app/admin/login/LoginForm";

export const metadata: Metadata = { title: "เข้าสู่ระบบ Admin" };

export default function AdminLoginPage() {
  return (
    <>
      <SiteHeader active="admin" />
      <main className="mx-auto flex max-w-[480px] flex-col gap-6 px-4 pt-12 pb-16 sm:px-8">
        <LoginForm />
      </main>
    </>
  );
}
