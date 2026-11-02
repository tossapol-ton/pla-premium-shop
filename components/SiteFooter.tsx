import Link from "next/link";
import { Suspense } from "react";
import { formatBaht } from "@/lib/format";
import { listCategories } from "@/lib/products";
import { categoryHref, SHIPPING_METHODS } from "@/lib/shop";

const heading = "m-0 mb-2 text-sm font-bold text-white";
const footerLink = "inline-flex min-h-8 items-center text-sm text-footer-ink no-underline hover:text-white hover:underline";

export function SiteFooter() {
  const { standard, express } = SHIPPING_METHODS;
  return (
    <footer className="mt-16 bg-brand-deep text-footer-ink">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-10 pb-8 sm:px-6">
        <p className="m-0 text-[13px] leading-relaxed">
          * ข้อมูลตัวอย่าง — สินค้า ราคา และสต็อกเป็นข้อมูลสมมติ รูปเป็นภาพประกอบ และยังไม่มีการชำระเงินจริง
        </p>
        <div className="grid gap-6 border-t border-footer-ink/25 pt-6 sm:grid-cols-3">
          <nav aria-labelledby="footer-shop" className="flex flex-col">
            <h2 id="footer-shop" className={heading}>
              ช้อปตามหมวด
            </h2>
            <Suspense fallback={null}>
              <FooterCategories />
            </Suspense>
          </nav>
          <section id="help" aria-labelledby="footer-help" className="flex flex-col gap-2 text-sm leading-relaxed">
            <h2 id="footer-help" className={heading}>
              บริการลูกค้า
            </h2>
            <p className="m-0">
              <strong className="text-white">การจัดส่ง:</strong> {standard.label} {standard.eta} {formatBaht(standard.fee)} ·{" "}
              {express.label} {express.eta} {formatBaht(express.fee)}
            </p>
            <p className="m-0">
              <strong className="text-white">ชำระเงิน:</strong> PromptPay QR (จำลอง) หรือเก็บเงินปลายทาง
            </p>
            <p className="m-0">
              <strong className="text-white">สั่งจำนวนมาก:</strong> [ติดต่อฝ่ายการตลาด]
            </p>
          </section>
          <section aria-labelledby="footer-about" className="flex flex-col gap-2 text-sm leading-relaxed">
            <h2 id="footer-about" className={heading}>
              เกี่ยวกับร้าน
            </h2>
            <p className="m-0">ของใช้และของขวัญติดแบรนด์ PhillipLife สำหรับลูกค้า คู่ค้า และทีมงาน</p>
            <p className="m-0">นโยบายความเป็นส่วนตัว: [รอลิงก์จากฝ่ายกฎหมาย]</p>
            <Link href="/tech-stack" className={footerLink}>
              Tech stack
            </Link>
          </section>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-footer-ink/25 pt-4 text-[13px]">
          <span>PhillipLife Premium Shop</span>
          <span>ประเทศไทย</span>
        </div>
      </div>
    </footer>
  );
}

async function FooterCategories() {
  const categories = await listCategories();
  return (
    <ul className="m-0 list-none p-0">
      {categories.map((category) => (
        <li key={category}>
          <Link href={categoryHref(category)} className={footerLink}>
            {category}
          </Link>
        </li>
      ))}
    </ul>
  );
}
