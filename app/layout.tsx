import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { BagDrawer } from "@/components/BagDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ของพรีเมียม PLA | PhillipLife Premium Shop",
    template: "%s | PLA Premium Shop",
  },
  description: "ของใช้และของขวัญติดแบรนด์ PhillipLife สำหรับลูกค้า คู่ค้า และทีมงาน (ข้อมูลตัวอย่าง)",
  icons: { icon: "/brand-mark.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <BagDrawer />
      </body>
    </html>
  );
}
