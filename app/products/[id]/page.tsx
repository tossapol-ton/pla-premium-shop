import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { LoadingPanel } from "@/components/LoadingPanel";
import { ProductDetail } from "@/app/products/[id]/ProductDetail";
import { getProduct } from "@/lib/products";

async function ProductLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <>
      <nav aria-label="breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted">
        <Link href="/">สินค้าทั้งหมด</Link>
        <span aria-hidden="true">/</span>
        <span>{product.category}</span>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>
      <ProductDetail product={product} />
    </>
  );
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <>
      <SiteHeader active="shop" />
      <main className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 pt-7 pb-16 sm:px-8">
        <Suspense fallback={<LoadingPanel label="กำลังโหลดสินค้า…" />}>
          <ProductLoader params={params} />
        </Suspense>
      </main>
    </>
  );
}
