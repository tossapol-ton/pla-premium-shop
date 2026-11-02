import Link from "next/link";
import { BuyButton } from "@/components/BuyButton";
import { ProductImage } from "@/components/ProductImage";
import { card } from "@/components/ui";
import { formatBaht } from "@/lib/format";
import { stockStatus, type Product } from "@/lib/shop";

const stockTone = { in: "text-muted", low: "text-accent-text font-bold", out: "text-muted" } as const;

/** Minimal product card: big image, few words, price and a "ซื้อ" pill. */
export function ProductCard({ product }: { product: Product }) {
  const status = stockStatus(product.stock);
  const href = `/products/${product.id}`;
  return (
    <article
      data-testid="product-card"
      data-product-id={product.id}
      className={`${card} flex h-full flex-col gap-2.5 p-5 transition-shadow duration-200 ease-standard hover:shadow-hover`}
    >
      <Link href={href} aria-label={`ดูรายละเอียด ${product.name}`} className="block no-underline">
        <ProductImage src={product.imageUrl} className="h-60 rounded-panel" />
      </Link>
      <span className="min-h-5 text-[13px] font-bold text-accent-text">{product.tag}</span>
      <h3 className="m-0 text-xl leading-snug font-bold">
        <Link href={href} className="text-body no-underline hover:text-navy-600">
          {product.name}
        </Link>
      </h3>
      <p className="m-0 line-clamp-2 text-sm text-muted">{product.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <div className="flex flex-col">
          <span className="text-lg font-bold">{formatBaht(product.price)}</span>
          <span className={`text-[13px] ${stockTone[status.kind]}`}>{status.label}</span>
        </div>
        <BuyButton product={product} />
      </div>
    </article>
  );
}
