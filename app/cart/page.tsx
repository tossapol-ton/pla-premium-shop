import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingPanel } from "@/components/LoadingPanel";
import { CartView } from "@/app/cart/CartView";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "ตะกร้าสินค้า" };

async function CartLoader() {
  const products = await listProducts();
  return <CartView products={products} />;
}

export default function CartPage() {
  return (
    <>
      <main className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-8">
        <h1 className="m-0 text-[30px] font-bold text-navy-900">ตะกร้าสินค้า</h1>
        <Suspense fallback={<LoadingPanel label="กำลังโหลดตะกร้า…" />}>
          <CartLoader />
        </Suspense>
      </main>
    </>
  );
}
