"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/Badge";
import { ProductImage } from "@/components/ProductImage";
import { buttonMd, buttonPrimary, card, pill } from "@/components/ui";
import { addToCart } from "@/lib/cart";
import { formatBaht } from "@/lib/format";
import type { Product } from "@/lib/shop";

const ALL = "ทั้งหมด";

type Toast = { kind: "added" | "full"; name: string };

export function ProductCatalog({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<string>(ALL);
  const [toast, setToast] = useState<Toast | null>(null);

  const categories = [ALL, ...Array.from(new Set(products.map((p) => p.category)))];
  const shown = category === ALL ? products : products.filter((p) => p.category === category);

  function handleAdd(product: Product) {
    const added = addToCart(product.id, product.options[0], 1, product.stock);
    setToast({ kind: added > 0 ? "added" : "full", name: product.name });
  }

  return (
    <>
      {toast && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2.5 rounded-panel bg-navy-100 px-4 py-3 text-sm text-navy-800"
        >
          <span>
            {toast.kind === "added"
              ? `เพิ่ม “${toast.name}” ลงตะกร้าแล้ว`
              : `“${toast.name}” ในตะกร้าครบจำนวนคงเหลือแล้ว`}
          </span>
          <Link href="/cart" className="font-bold">
            ไปที่ตะกร้า
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[26px] font-bold text-navy-900">สินค้าทั้งหมด</h2>
          <p className="m-0 text-sm text-muted">แสดง {shown.length} รายการ</p>
        </div>
        <div role="group" aria-label="กรองตามหมวดหมู่" className="flex flex-wrap gap-2">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={`min-h-10 rounded-pill border px-4 text-sm font-bold ${pill(category === name)}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5 p-0">
        {shown.map((product) => {
          const soldOut = product.stock <= 0;
          return (
            <li key={product.id} data-testid="product-card" data-product-id={product.id}>
              <article className={`${card} flex h-full flex-col overflow-hidden shadow-card`}>
                <Link
                  href={`/products/${product.id}`}
                  aria-label={`ดูรายละเอียด ${product.name}`}
                  className="relative block no-underline"
                >
                  <ProductImage src={product.imageUrl} className="h-[180px]" />
                  {product.tag && (
                    <span className="absolute top-3 left-3">
                      <Badge>{product.tag}</Badge>
                    </span>
                  )}
                </Link>
                <div className="flex grow flex-col gap-2 px-[18px] pt-4 pb-[18px]">
                  <span className="text-xs font-bold tracking-[0.08em] text-muted">{product.category}</span>
                  <h3 className="m-0 text-[17px] leading-snug font-bold text-navy-900">
                    <Link href={`/products/${product.id}`} className="text-inherit no-underline hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  <div className="mt-auto flex items-baseline justify-between gap-2 pt-1.5">
                    <span className="text-xl font-bold text-navy-600">{formatBaht(product.price)}</span>
                    <span className="text-xs text-muted">{soldOut ? "สินค้าหมด" : `คงเหลือ ${product.stock}`}</span>
                  </div>
                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => handleAdd(product)}
                    aria-label={soldOut ? `${product.name} สินค้าหมด` : `ใส่ตะกร้า ${product.name}`}
                    className={`${buttonPrimary} ${buttonMd}`}
                  >
                    ใส่ตะกร้า
                  </button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
