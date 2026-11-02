import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { LoadingPanel } from "@/components/LoadingPanel";
import { AdminPanel } from "@/app/admin/AdminPanel";
import { isAdminRequest } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Admin" };

async function AdminLoader() {
  // proxy.ts already redirects signed-out visitors; check again next to the data.
  if (!(await isAdminRequest())) redirect("/admin/login");
  const [products, orders] = await Promise.all([listProducts(), listOrders()]);
  return <AdminPanel products={products} orders={orders} />;
}

export default function AdminPage() {
  return (
    <>
      <SiteHeader active="admin" />
      <main className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-8">
        <Suspense fallback={<LoadingPanel label="กำลังโหลดข้อมูล Admin…" />}>
          <AdminLoader />
        </Suspense>
        <p className="m-0 text-[13px] text-muted">
          ล็อกอินด้วยรหัสผ่านเดียว (ยังไม่มีบัญชีผู้ใช้รายบุคคล) · สินค้าและราคาเป็นข้อมูลสมมติ
        </p>
      </main>
    </>
  );
}
