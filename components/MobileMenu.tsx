"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { categoryHref } from "@/lib/shop";

/** Phone-width navigation: hamburger that opens a full-screen menu. */
export function MobileMenu({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const bigLink = "flex min-h-12 items-center text-[26px] leading-tight font-bold text-body no-underline hover:text-navy-600";
  const smallLink = "flex min-h-11 items-center text-base font-bold text-body no-underline hover:text-navy-600";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-body hover:bg-brand-soft"
      >
        {open ? <CloseIcon size={22} strokeWidth={1.75} /> : <MenuIcon size={22} strokeWidth={1.75} />}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="เมนูหลัก"
          className="fixed inset-x-0 top-[53px] bottom-0 z-30 flex flex-col gap-6 overflow-y-auto bg-white px-8 py-6"
        >
          <div className="flex flex-col">
            <span className="mb-2 text-[13px] text-muted">ช้อปตามหมวด</span>
            <Link href="/#shop" onClick={close} className={bigLink}>
              ทั้งหมด
            </Link>
            {categories.map((category) => (
              <Link key={category} href={categoryHref(category)} onClick={close} className={bigLink}>
                {category}
              </Link>
            ))}
          </div>
          <div className="flex flex-col border-t border-line pt-4">
            <span className="mb-2 text-[13px] text-muted">บริการลูกค้า</span>
            <Link href="/cart" onClick={close} className={smallLink}>
              ตะกร้าสินค้า
            </Link>
            <a href="#help" onClick={close} className={smallLink}>
              การจัดส่งและการชำระเงิน
            </a>
          </div>
          <div className="flex flex-col border-t border-line pt-4">
            <span className="mb-2 text-[13px] text-muted">เกี่ยวกับร้าน</span>
            <Link href="/tech-stack" onClick={close} className={smallLink}>
              Tech stack
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
