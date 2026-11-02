import Link from "next/link";
import { Suspense } from "react";
import { LoadingPanel } from "@/components/LoadingPanel";
import { ProductCard } from "@/components/ProductCard";
import { SampleDataNote } from "@/components/SampleDataNote";
import { pill } from "@/components/ui";
import { Showcase } from "@/app/_components/Showcase";
import { listAllProductsCached, listCategories } from "@/lib/products";
import { categoryHref } from "@/lib/shop";

async function ShowcaseLoader() {
  const [products, categories] = await Promise.all([listAllProductsCached(), listCategories()]);
  return <Showcase products={products} categories={categories} />;
}

async function Catalog({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, products, categories] = await Promise.all([searchParams, listAllProductsCached(), listCategories()]);
  const requested = typeof params.cat === "string" ? params.cat : null;
  const active = requested && categories.includes(requested) ? requested : null;
  const shown = active ? products.filter((p) => p.category === active) : products;
  const filters: { label: string; href: string; selected: boolean }[] = [
    { label: "ทั้งหมด", href: "/#shop", selected: active === null },
    ...categories.map((c) => ({ label: c, href: categoryHref(c), selected: active === c })),
  ];

  return (
    <section id="shop" aria-labelledby="shop-title" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="shop-title" className="m-0 text-[28px] leading-9 font-bold text-navy-600">
            {active ?? "สินค้าทั้งหมด"}
          </h2>
          <p className="m-0 text-sm text-muted">แสดง {shown.length} รายการ</p>
        </div>
        <nav aria-label="กรองตามหมวด" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.href}
              aria-current={f.selected ? "true" : undefined}
              className={`inline-flex min-h-11 items-center rounded-pill border px-4 text-sm font-bold no-underline ${pill(f.selected)}`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6 p-0">
        {shown.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <SampleDataNote />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-6 sm:px-6">
        <Suspense fallback={<LoadingPanel label="กำลังโหลด…" />}>
          <ShowcaseLoader />
        </Suspense>
        <Suspense fallback={<LoadingPanel label="กำลังโหลดสินค้า…" />}>
          <Catalog searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
