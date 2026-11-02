import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingPanel } from "@/components/LoadingPanel";
import { CheckoutForm } from "@/app/checkout/CheckoutForm";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "ชำระเงิน" };

async function CheckoutLoader() {
  const products = await listProducts();
  return <CheckoutForm products={products} />;
}

export default function CheckoutPage() {
  return (
    <>
      <main className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-8">
        <Suspense fallback={<LoadingPanel label="กำลังโหลด…" />}>
          <CheckoutLoader />
        </Suspense>
      </main>
    </>
  );
}
