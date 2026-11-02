import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonMd, buttonPrimary, card } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1180px] px-4 py-16 sm:px-8">
        <div className={`${card} flex flex-col items-center gap-3.5 px-6 py-16 text-center`}>
          <h1 className="m-0 text-2xl font-bold text-navy-900">ไม่พบหน้าที่ต้องการ</h1>
          <p className="m-0 text-muted">สินค้าหรือหน้านี้อาจถูกนำออกแล้ว</p>
          <Link href="/" className={`${buttonPrimary} ${buttonMd}`}>
            กลับไปหน้าร้าน
          </Link>
        </div>
      </main>
    </>
  );
}
