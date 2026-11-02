"use client";

import { CartIcon } from "@/components/CartIcon";
import { openBag, useBag, useCartCount } from "@/lib/cart";

/** Header bag icon with item count; opens the Bag drawer. */
export function CartButton() {
  const count = useCartCount();
  const bag = useBag();
  return (
    <button
      type="button"
      onClick={() => openBag()}
      aria-label={`ตะกร้าสินค้า ${count} ชิ้น`}
      aria-haspopup="dialog"
      aria-expanded={bag.open}
      data-testid="cart-button"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-pill text-navy-600 transition-colors hover:bg-brand-soft"
    >
      <CartIcon size={22} strokeWidth={1.75} />
      <span
        data-testid="cart-count"
        className="absolute top-0.5 right-0 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-navy-600 px-1.5 text-[11px] font-bold text-white"
      >
        {count}
      </span>
    </button>
  );
}
