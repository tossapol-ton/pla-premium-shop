"use client";

import Link from "next/link";
import { useCartCount } from "@/lib/cart";
import { CartIcon } from "@/components/CartIcon";

export function CartLink({ active }: { active: boolean }) {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-current={active ? "page" : undefined}
      aria-label={`ตะกร้าสินค้า ${count} ชิ้น`}
      data-testid="cart-link"
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 text-sm font-bold no-underline ${
        active ? "border-navy-600 bg-navy-100" : "border-line-strong"
      }`}
    >
      <CartIcon />
      ตะกร้า
      <span
        data-testid="cart-count"
        className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-pill bg-navy-600 px-1.5 text-xs text-white"
      >
        {count}
      </span>
    </Link>
  );
}
