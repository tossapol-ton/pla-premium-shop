import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CartButton } from "@/components/CartButton";
import { MobileMenu } from "@/components/MobileMenu";
import { listCategories } from "@/lib/products";
import { categoryHref } from "@/lib/shop";

/** Slim, translucent, sticky header: logo · categories · bag. No Admin link (staff use /admin). */
export function SiteHeader() {
  return (
    <header className="bg-frosted sticky top-0 z-30 border-b border-line">
      <div className="mx-auto flex min-h-[52px] max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="PLA Premium Shop หน้าแรก" className="flex min-h-11 shrink-0 items-center gap-2.5 no-underline">
          <Image src="/logo-navy.png" alt="PhillipLife" width={59} height={22} loading="eager" />
          <span className="text-[13px] font-bold text-body">Premium Shop</span>
        </Link>
        <Suspense fallback={<div className="hidden flex-1 md:block" />}>
          <DesktopCategoryNav />
        </Suspense>
        <div className="flex items-center">
          <CartButton />
          <Suspense fallback={<span className="inline-block h-11 w-11 md:hidden" />}>
            <MobileMenuLoader />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function DesktopCategoryNav() {
  const categories = await listCategories();
  return (
    <nav aria-label="หมวดสินค้า" className="hidden flex-1 flex-wrap justify-center gap-x-6 text-[13px] md:flex">
      {categories.map((category) => (
        <Link
          key={category}
          href={categoryHref(category)}
          className="inline-flex min-h-11 items-center text-body no-underline hover:text-navy-600"
        >
          {category}
        </Link>
      ))}
    </nav>
  );
}

async function MobileMenuLoader() {
  const categories = await listCategories();
  return <MobileMenu categories={categories} />;
}
