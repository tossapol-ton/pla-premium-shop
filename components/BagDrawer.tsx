"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { CheckCircleIcon, CloseIcon } from "@/components/icons";
import { ProductImage } from "@/components/ProductImage";
import { buttonLg, buttonPrimary, buttonSecondary } from "@/components/ui";
import { closeBag, resolveCart, useBag, useCart } from "@/lib/cart";
import { formatBaht } from "@/lib/format";
import type { Product } from "@/lib/shop";

function isProductsBody(body: unknown): body is { products: Product[] } {
  return typeof body === "object" && body !== null && "products" in body && Array.isArray(body.products);
}

/**
 * Slide-in cart panel (right side). Opens after "ซื้อ"/"เพิ่มลงตะกร้า" and from the
 * header bag icon. Uses a native <dialog> for focus trapping, Esc and backdrop.
 * Product data is fetched fresh on every open so prices and stock are current.
 */
export function BagDrawer() {
  const bag = useBag();
  const cart = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (bag.open && !dialog.open) dialog.showModal();
    if (!bag.open && dialog.open) dialog.close();
  }, [bag.open]);

  useEffect(() => {
    if (!bag.open) return;
    let cancelled = false;
    fetch("/api/products")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((body: unknown) => {
        if (cancelled) return;
        if (isProductsBody(body)) {
          setProducts(body.products);
          setLoadFailed(false);
        } else {
          setLoadFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [bag.open]);

  function onBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // Clicks on the ::backdrop target the <dialog> element itself.
    if (event.target === event.currentTarget) closeBag();
  }

  const resolved = products ? resolveCart(cart, products) : null;
  const added =
    bag.justAdded && products
      ? (() => {
          const product = products.find((p) => p.id === bag.justAdded?.productId);
          return product ? { product, option: bag.justAdded.option, quantity: bag.justAdded.quantity } : null;
        })()
      : null;
  const isEmpty = resolved ? resolved.lines.length === 0 : cart.length === 0;

  return (
    <dialog
      ref={dialogRef}
      onClose={() => closeBag()}
      onClick={onBackdropClick}
      aria-labelledby="bag-title"
      data-testid="bag-drawer"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[420px] max-w-full bg-white p-0 text-body shadow-hover backdrop:bg-brand-deep/40"
    >
      <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-3">
          {bag.justAdded ? (
            <h2 id="bag-title" className="m-0 flex items-center gap-2 text-xl font-bold text-success">
              <CheckCircleIcon size={22} />
              เพิ่มลงตะกร้าแล้ว
            </h2>
          ) : (
            <h2 id="bag-title" className="m-0 text-xl font-bold text-navy-600">
              ตะกร้าของคุณ
            </h2>
          )}
          <button
            type="button"
            onClick={() => closeBag()}
            aria-label="ปิดตะกร้า"
            className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-page text-body hover:bg-brand-soft"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {added && (
          <div className="flex items-center gap-4 rounded-panel bg-brand-soft p-4" data-testid="bag-just-added">
            <ProductImage
              src={added.product.imageUrl}
              size="sm"
              className="h-[72px] w-[72px] shrink-0 rounded-panel bg-white!"
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-bold">{added.product.name}</span>
              <span className="text-sm text-muted">
                ตัวเลือก: {added.option} · จำนวน {added.quantity}
              </span>
              <span className="font-bold">{formatBaht(added.product.price * added.quantity)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <h3 className="m-0 mb-1 text-sm font-bold text-muted">
            ในตะกร้า ({resolved ? resolved.itemCount : cart.reduce((n, l) => n + l.quantity, 0)} ชิ้น)
          </h3>
          {loadFailed && !resolved && <p className="m-0 text-sm text-danger">โหลดข้อมูลสินค้าไม่สำเร็จ กรุณาลองใหม่</p>}
          {!resolved && !loadFailed && <p className="m-0 text-sm text-muted">กำลังโหลด…</p>}
          {resolved && isEmpty && <p className="m-0 text-base text-muted">ยังไม่มีสินค้าในตะกร้า</p>}
          {resolved && (
            <ul className="m-0 list-none p-0">
              {resolved.lines.map((line) => (
                <li
                  key={`${line.productId}|${line.option}`}
                  data-testid="bag-line"
                  className="flex items-center gap-3 border-b border-line py-2.5"
                >
                  <ProductImage src={line.imageUrl} size="sm" className="h-12 w-12 shrink-0 rounded-btn" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-bold">{line.name}</span>
                    <span className="text-[13px] text-muted">
                      {line.option} × {line.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{formatBaht(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {resolved && !isEmpty && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between gap-3 text-base font-bold">
              <span>ยอดรวมสินค้า</span>
              <span data-testid="bag-subtotal">{formatBaht(resolved.subtotal)}</span>
            </div>
            <span className="text-[13px] text-muted">ค่าจัดส่งคำนวณในขั้นตอนชำระเงิน</span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          {isEmpty ? (
            <Link href="/#shop" onClick={() => closeBag()} className={`${buttonPrimary} ${buttonLg}`}>
              เลือกซื้อสินค้า
            </Link>
          ) : (
            <>
              <Link href="/checkout" onClick={() => closeBag()} className={`${buttonPrimary} ${buttonLg}`}>
                ชำระเงิน
              </Link>
              <Link href="/cart" onClick={() => closeBag()} className={`${buttonSecondary} ${buttonLg}`}>
                ดูตะกร้า
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => closeBag()}
            className="min-h-11 bg-transparent text-sm font-bold text-navy-600 hover:underline"
          >
            เลือกซื้อสินค้าต่อ
          </button>
        </div>
      </div>
    </dialog>
  );
}
