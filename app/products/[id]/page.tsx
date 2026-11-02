import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingPanel } from "@/components/LoadingPanel";
import { ProductCard } from "@/components/ProductCard";
import { section } from "@/components/ui";
import { ProductDetail } from "@/app/products/[id]/ProductDetail";
import { listAllProductsCached } from "@/lib/products";
import { OPTION_KIND_LABEL, optionKind, type Product } from "@/lib/shop";

/** Same category first, then the rest; never the product itself. */
function relatedTo(product: Product, products: Product[], count: number): Product[] {
  const others = products.filter((p) => p.id !== product.id);
  const sameCategory = others.filter((p) => p.category === product.category);
  const rest = others.filter((p) => p.category !== product.category);
  return [...sameCategory, ...rest].slice(0, count);
}

async function ProductLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await listAllProductsCached();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const related = relatedTo(product, products, 3);
  const kindLabel = OPTION_KIND_LABEL[optionKind(product.options)];

  return (
    <ProductDetail product={product}>
      <section aria-labelledby="details-title" className={`${section} flex flex-col gap-4 px-6 py-8`}>
        <h2 id="details-title" className="m-0 text-[28px] leading-9 font-bold text-navy-600">
          รายละเอียดสินค้า
        </h2>
        <p className="m-0 text-base leading-relaxed">{product.description}</p>
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-6 gap-y-4">
          <div className="flex flex-col gap-0.5 border-t border-line pt-3">
            <dt className="text-sm text-muted">หมวดหมู่</dt>
            <dd className="m-0 text-base">{product.category}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-t border-line pt-3">
            <dt className="text-sm text-muted">{kindLabel}ที่มี</dt>
            <dd className="m-0 text-base">{product.options.join(", ")}</dd>
          </div>
        </dl>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="flex flex-col gap-5">
          <h2 id="related-title" className="m-0 text-[28px] leading-9 font-bold text-navy-600">
            สินค้าอื่นที่น่าสนใจ
          </h2>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6 p-0">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </ProductDetail>
  );
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-6">
          <LoadingPanel label="กำลังโหลดสินค้า…" />
        </div>
      }
    >
      <ProductLoader params={params} />
    </Suspense>
  );
}
