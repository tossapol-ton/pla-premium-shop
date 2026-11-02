"use client";

import Link from "next/link";
import { buttonMd, buttonPrimary, buttonSecondary } from "@/components/ui";
import { addToBag } from "@/lib/cart";
import type { Product } from "@/lib/shop";

type BuyButtonProps = {
  product: Pick<Product, "id" | "name" | "options" | "stock">;
  /** primary = the one orange CTA of a showcase tile; secondary = cards. */
  variant?: "primary" | "secondary";
  className?: string;
};

/**
 * "ซื้อ": single-option products go straight into the Bag drawer; products
 * with a colour/size choice open the product page so the shopper picks one.
 */
export function BuyButton({ product, variant = "secondary", className = "" }: BuyButtonProps) {
  const style = `${variant === "primary" ? buttonPrimary : buttonSecondary} ${buttonMd} ${className}`;

  if (product.stock <= 0) {
    return (
      <button type="button" disabled aria-label={`${product.name} สินค้าหมด`} className={style}>
        สินค้าหมด
      </button>
    );
  }

  if (product.options.length > 1) {
    return (
      <Link href={`/products/${product.id}`} aria-label={`ซื้อ ${product.name} (เลือกตัวเลือก)`} className={style}>
        ซื้อ
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToBag(product.id, product.options[0], 1, product.stock)}
      aria-label={`ซื้อ ${product.name}`}
      className={style}
    >
      ซื้อ
    </button>
  );
}
