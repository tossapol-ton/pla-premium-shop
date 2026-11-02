import Image from "next/image";
import Link from "next/link";
import { CartLink } from "@/components/CartLink";

type Section = "shop" | "admin" | "cart" | "checkout" | "none";

export function SiteHeader({ active = "none" }: { active?: Section }) {
  const navItem = (selected: boolean) =>
    `rounded-lg px-3.5 py-2.5 text-sm no-underline ${
      selected ? "bg-navy-100 font-bold text-navy-600" : "text-body hover:bg-subtle hover:text-navy-600"
    }`;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-white px-4 py-4 sm:px-8">
      <Link href="/" aria-label="PLA Premium Shop หน้าแรก" className="flex items-center gap-3.5 no-underline">
        <Image src="/logo-navy.png" alt="PhillipLife" width={75} height={28} priority />
        <span className="border-l border-line pl-3.5 text-[15px] font-bold text-navy-900">Premium Shop</span>
      </Link>
      <nav aria-label="เมนูหลัก" className="flex flex-wrap items-center gap-1">
        <Link href="/" aria-current={active === "shop" ? "page" : undefined} className={navItem(active === "shop")}>
          สินค้าทั้งหมด
        </Link>
        <Link
          href="/admin"
          aria-current={active === "admin" ? "page" : undefined}
          className={navItem(active === "admin")}
        >
          Admin
        </Link>
        <CartLink active={active === "cart" || active === "checkout"} />
      </nav>
    </header>
  );
}
