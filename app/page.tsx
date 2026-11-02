import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SampleDataNote } from "@/components/SampleDataNote";
import { LoadingPanel } from "@/components/LoadingPanel";
import { ProductCatalog } from "@/app/_components/ProductCatalog";
import { listProducts } from "@/lib/products";

async function CatalogLoader() {
  const products = await listProducts();
  return <ProductCatalog products={products} />;
}

export default function HomePage() {
  return (
    <>
      <SiteHeader active="shop" />

      <section className="bg-hero text-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3.5 px-4 pt-14 pb-16 sm:px-8">
          <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.14em] text-white/80 uppercase">
            <span aria-hidden="true" className="h-0.5 w-6 bg-orange-500" />
            PhillipLife Premium Collection
          </span>
          <h1 className="m-0 max-w-[720px] text-3xl leading-tight font-bold tracking-[-0.01em] sm:text-[44px]">
            ของพรีเมียมคุณภาพ ในแบบของ PhillipLife
          </h1>
          <p className="m-0 max-w-[620px] text-[17px] leading-relaxed text-white/80">
            ของใช้และของขวัญติดแบรนด์ สำหรับมอบให้ลูกค้า คู่ค้า และทีมงาน
          </p>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-8">
        <SampleDataNote />
        <Suspense fallback={<LoadingPanel label="กำลังโหลดสินค้า…" />}>
          <CatalogLoader />
        </Suspense>
      </main>
    </>
  );
}
