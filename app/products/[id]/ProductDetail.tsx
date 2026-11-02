"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/Badge";
import { ProductImage } from "@/components/ProductImage";
import { buttonLg, buttonPrimary, buttonSecondary, pill } from "@/components/ui";
import { addToCart, quantityInCart, useCart } from "@/lib/cart";
import { formatBaht } from "@/lib/format";
import type { Product } from "@/lib/shop";

type Notice = { kind: "added"; quantity: number; option: string } | { kind: "full" };

export function ProductDetail({ product }: { product: Product }) {
  const cart = useCart();
  const [option, setOption] = useState(product.options[0]);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<Notice | null>(null);

  const soldOut = product.stock <= 0;
  const inCart = quantityInCart(cart, product.id);
  const maxQuantity = Math.max(1, product.stock);

  function change(next: number) {
    setQuantity(Math.min(maxQuantity, Math.max(1, next)));
    setNotice(null);
  }

  function handleAdd() {
    const added = addToCart(product.id, option, quantity, product.stock);
    setNotice(added > 0 ? { kind: "added", quantity: added, option } : { kind: "full" });
  }

  return (
    <div className="flex flex-wrap items-start gap-9">
      <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-3">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          size="lg"
          className="h-[320px] rounded-card border border-line sm:h-[460px]"
        />
        <p className="m-0 text-[13px] text-muted">ภาพประกอบ · สินค้าจริงอาจแตกต่าง</p>
      </div>

      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          {product.tag && (
            <div>
              <Badge>{product.tag}</Badge>
            </div>
          )}
          <h1 className="m-0 text-[28px] leading-tight font-bold tracking-[-0.01em] text-navy-900 sm:text-[34px]">
            {product.name}
          </h1>
          <span className="text-[30px] font-bold text-navy-600">{formatBaht(product.price)}</span>
          <p className="m-0 text-base leading-relaxed text-body">{product.description}</p>
        </div>

        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 p-0 text-sm font-bold text-navy-900">ตัวเลือก</legend>
          <div className="flex flex-wrap gap-2">
            {product.options.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={option === name}
                onClick={() => {
                  setOption(name);
                  setNotice(null);
                }}
                className={`min-h-11 min-w-[72px] rounded-btn border px-[18px] text-[15px] font-bold ${pill(option === name)}`}
              >
                {name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <span id="qty-label" className="text-sm font-bold text-navy-900">
            จำนวน
          </span>
          <div role="group" aria-labelledby="qty-label" className="flex flex-wrap items-center gap-3.5">
            <div className="inline-flex items-center rounded-btn border border-line-strong bg-white">
              <button
                type="button"
                aria-label="ลดจำนวน"
                onClick={() => change(quantity - 1)}
                disabled={soldOut || quantity <= 1}
                className="h-11 w-11 text-xl text-navy-600 disabled:text-line-strong"
              >
                −
              </button>
              <span aria-live="polite" data-testid="qty" className="min-w-10 text-center text-base font-bold">
                {soldOut ? 0 : quantity}
              </span>
              <button
                type="button"
                aria-label="เพิ่มจำนวน"
                onClick={() => change(quantity + 1)}
                disabled={soldOut || quantity >= maxQuantity}
                className="h-11 w-11 text-xl text-navy-600 disabled:text-line-strong"
              >
                +
              </button>
            </div>
            <span className="text-sm text-muted">
              คงเหลือ {product.stock} ชิ้น{inCart > 0 && ` · ในตะกร้าแล้ว ${inCart} ชิ้น`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={soldOut} onClick={handleAdd} className={`${buttonPrimary} ${buttonLg}`}>
            {soldOut ? "สินค้าหมด" : `ใส่ตะกร้า · ${formatBaht(product.price * quantity)}`}
          </button>
          <Link href="/cart" className={`${buttonSecondary} ${buttonLg}`}>
            ไปที่ตะกร้า
          </Link>
        </div>

        {notice && (
          <div role="status" className="rounded-panel bg-navy-100 px-4 py-3 text-sm text-navy-800">
            {notice.kind === "added"
              ? `เพิ่ม ${notice.quantity} ชิ้น (${notice.option}) ลงตะกร้าแล้ว`
              : "ในตะกร้ามีสินค้านี้ครบจำนวนคงเหลือแล้ว"}
          </div>
        )}

        <dl className="m-0 flex flex-col gap-2.5 border-t border-line pt-[18px] text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">หมวดหมู่</dt>
            <dd className="m-0 font-bold">{product.category}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">จัดส่ง</dt>
            <dd className="m-0 font-bold">มาตรฐาน 3–5 วันทำการ</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">สั่งจำนวนมาก</dt>
            <dd className="m-0 font-bold">[ติดต่อฝ่ายการตลาด]</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
