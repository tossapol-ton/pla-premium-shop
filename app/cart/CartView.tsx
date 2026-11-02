"use client";

import Link from "next/link";
import { CartIcon } from "@/components/CartIcon";
import { ProductImage } from "@/components/ProductImage";
import { buttonLg, buttonMd, buttonPrimary, card } from "@/components/ui";
import { removeLine, resolveCart, setLineQuantity, useCart } from "@/lib/cart";
import { formatBaht } from "@/lib/format";
import type { Product } from "@/lib/shop";

export function CartView({ products }: { products: Product[] }) {
  const cart = useCart();
  const { lines, unavailable, itemCount, subtotal } = resolveCart(cart, products);
  const stockById = new Map(products.map((p) => [p.id, p.stock]));
  const inCartById = new Map<string, number>();
  for (const line of lines) inCartById.set(line.productId, (inCartById.get(line.productId) ?? 0) + line.quantity);

  if (lines.length === 0 && unavailable.length === 0) {
    return (
      <div className={`${card} flex flex-col items-center gap-3.5 px-6 py-16 text-center`}>
        <span className="text-gray-500">
          <CartIcon size={40} strokeWidth={1.5} />
        </span>
        <p className="m-0 text-[17px] font-bold text-navy-900">ยังไม่มีสินค้าในตะกร้า</p>
        <Link href="/" className={`${buttonPrimary} ${buttonMd}`}>
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-7">
      <section
        aria-label="รายการในตะกร้า"
        className={`${card} flex min-w-0 flex-[999_1_560px] flex-col overflow-hidden`}
      >
        {unavailable.map((line) => (
          <div
            key={`${line.productId}|${line.option}`}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-danger-50 px-[22px] py-3 text-sm text-danger"
          >
            <span>สินค้าบางรายการไม่มีจำหน่ายแล้ว ({line.productId} · {line.option})</span>
            <button
              type="button"
              onClick={() => removeLine(line.productId, line.option)}
              className="font-bold underline"
            >
              นำออก
            </button>
          </div>
        ))}
        <ul className="m-0 list-none p-0">
          {lines.map((line) => {
            const stock = stockById.get(line.productId) ?? 0;
            const totalForProduct = inCartById.get(line.productId) ?? 0;
            const overStock = totalForProduct > stock;
            const canIncrease = totalForProduct < stock;
            return (
              <li
                key={`${line.productId}|${line.option}`}
                data-testid="cart-line"
                className="flex flex-wrap items-center gap-[18px] border-b border-line px-[22px] py-[18px]"
              >
                <ProductImage
                  src={line.imageUrl}
                  size="sm"
                  className="h-[76px] w-[76px] shrink-0 rounded-panel border border-line"
                />
                <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-1">
                  <Link href={`/products/${line.productId}`} className="text-base font-bold text-navy-900 no-underline">
                    {line.name}
                  </Link>
                  <span className="text-sm text-muted">
                    ตัวเลือก: {line.option} · {formatBaht(line.unitPrice)} / ชิ้น
                  </span>
                  {overStock && (
                    <span className="text-[13px] text-danger">สินค้าคงเหลือ {stock} ชิ้น กรุณาลดจำนวน</span>
                  )}
                </div>
                <div className="inline-flex items-center rounded-btn border border-line-strong">
                  <button
                    type="button"
                    aria-label={`ลดจำนวน ${line.name} ${line.option}`}
                    onClick={() => setLineQuantity(line.productId, line.option, line.quantity - 1)}
                    disabled={line.quantity <= 1}
                    className="h-11 w-11 text-xl text-navy-600 disabled:text-line-strong"
                  >
                    −
                  </button>
                  <span className="min-w-9 text-center text-[15px] font-bold" data-testid="cart-line-qty">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`เพิ่มจำนวน ${line.name} ${line.option}`}
                    onClick={() => setLineQuantity(line.productId, line.option, line.quantity + 1)}
                    disabled={!canIncrease}
                    className="h-11 w-11 text-xl text-navy-600 disabled:text-line-strong"
                  >
                    +
                  </button>
                </div>
                <span className="min-w-24 text-right text-[17px] font-bold text-navy-900">
                  {formatBaht(line.lineTotal)}
                </span>
                <button
                  type="button"
                  aria-label={`ลบ ${line.name} ${line.option} ออกจากตะกร้า`}
                  onClick={() => removeLine(line.productId, line.option)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-btn text-muted hover:bg-subtle hover:text-danger"
                >
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="px-[22px] py-4">
          <Link href="/" className="text-sm font-bold">
            ← เลือกซื้อสินค้าต่อ
          </Link>
        </div>
      </section>

      <aside className={`${card} flex min-w-0 flex-[1_1_320px] flex-col gap-4 p-6 shadow-raised`}>
        <h2 className="m-0 text-lg font-bold text-navy-900">สรุปยอด</h2>
        <dl className="m-0 flex flex-col gap-2.5 text-[15px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">สินค้า ({itemCount} ชิ้น)</dt>
            <dd className="m-0 font-bold">{formatBaht(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">ค่าจัดส่ง</dt>
            <dd className="m-0 text-muted">คำนวณในขั้นถัดไป</dd>
          </div>
        </dl>
        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3.5">
          <span className="text-[15px] font-bold text-navy-900">ยอดรวม</span>
          <span className="text-[26px] font-bold text-navy-600" data-testid="cart-subtotal">
            {formatBaht(subtotal)}
          </span>
        </div>
        {lines.length > 0 ? (
          <Link href="/checkout" className={`${buttonPrimary} ${buttonLg}`}>
            ไปหน้าชำระเงิน
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={`${buttonLg} inline-flex cursor-not-allowed items-center justify-center rounded-btn bg-line-strong px-5 font-bold text-muted`}
          >
            ไปหน้าชำระเงิน
          </span>
        )}
      </aside>
    </div>
  );
}
