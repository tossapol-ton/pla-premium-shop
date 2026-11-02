import type { Metadata } from "next";
import { ArrowRightIcon, UserIcon } from "@/components/icons";
import { TechLogo, type TechLogoId } from "@/components/TechLogo";
import { card, section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tech stack",
  description: "เทคโนโลยีที่ใช้สร้าง PLA Premium Shop",
};

type Tech = { name: string; logo: TechLogoId };

const FLOW: { title: string; detail: string; logo: TechLogoId | null }[] = [
  { title: "ผู้ใช้", detail: "เบราว์เซอร์ / มือถือ", logo: null },
  { title: "Vercel", detail: "Next.js: หน้าเว็บ + API", logo: "vercel" },
  { title: "Supabase", detail: "PostgreSQL", logo: "supabase" },
];

const STACK: { id: string; label: string; tech: Tech[]; note: string }[] = [
  {
    id: "frontend",
    label: "Frontend",
    tech: [
      { name: "Next.js 16", logo: "nextjs" },
      { name: "React 19", logo: "react" },
      { name: "TypeScript", logo: "typescript" },
      { name: "Tailwind CSS 4", logo: "tailwindcss" },
    ],
    note: "หน้าเว็บทั้งหมด รองรับทั้งคอมพิวเตอร์และมือถือ",
  },
  {
    id: "backend",
    label: "Backend",
    tech: [
      { name: "Next.js API Routes (REST)", logo: "nextjs" },
      { name: "Prisma ORM", logo: "prisma" },
      { name: "zod", logo: "zod" },
    ],
    note: "API สินค้า คำสั่งซื้อ และระบบเข้าสู่ระบบ Admin",
  },
  {
    id: "database",
    label: "Database",
    tech: [
      { name: "PostgreSQL", logo: "postgresql" },
      { name: "Supabase", logo: "supabase" },
    ],
    note: "เก็บข้อมูลสินค้า สต็อก และคำสั่งซื้อ",
  },
  {
    id: "hosting",
    label: "Hosting",
    tech: [{ name: "Vercel", logo: "vercel" }],
    note: "เผยแพร่เว็บอัตโนมัติเมื่อรวมโค้ดเข้า main",
  },
  {
    id: "source",
    label: "Source code",
    tech: [{ name: "GitHub", logo: "github" }],
    note: "เก็บโค้ดและตรวจงานผ่าน Pull Request",
  },
  {
    id: "testing",
    label: "Testing",
    tech: [{ name: "Playwright", logo: "playwright" }],
    note: "ทดสอบการสั่งซื้อตั้งแต่ต้นจนจบแบบอัตโนมัติ",
  },
  {
    id: "design",
    label: "Design",
    tech: [
      { name: "Claude Design", logo: "claude" },
      { name: "Design System “PLA Shop”", logo: "plashop" },
    ],
    note: "ต้นแบบหน้าจอ สี และตัวอักษรของร้าน",
  },
];

export default function TechStackPage() {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 pt-6 sm:px-6">
      <section className={`${section} relative flex flex-col items-center gap-3 overflow-hidden px-6 py-14 text-center`}>
        <div aria-hidden="true" className="absolute -top-40 -right-28 h-80 w-80 rounded-pill bg-orange-500 opacity-30" />
        <div aria-hidden="true" className="absolute -bottom-36 -left-24 h-72 w-72 rounded-pill bg-navy-600 opacity-30" />
        <span className="relative text-sm font-bold text-accent-text">เบื้องหลังร้าน</span>
        <h1 className="relative m-0 text-4xl leading-tight font-bold text-navy-600 sm:text-[44px]">Tech stack</h1>
        <p className="relative m-0 max-w-xl text-lg leading-relaxed text-muted">
          เทคโนโลยีที่ใช้สร้าง PLA Premium Shop ตั้งแต่หน้าเว็บจนถึงฐานข้อมูล
        </p>
      </section>

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6 p-0">
        {STACK.map(({ id, label, tech, note }) => (
          <li key={id} data-testid="stack-item">
            <article
              aria-labelledby={`stack-${id}`}
              className={`${card} flex h-full flex-col gap-4 p-6 transition-shadow duration-200 ease-standard hover:shadow-hover`}
            >
              <div className="flex flex-col gap-1">
                <h2 id={`stack-${id}`} className="m-0 text-xl font-bold text-navy-600">
                  {label}
                </h2>
                <p className="m-0 text-sm text-muted">{note}</p>
              </div>
              <ul className="m-0 mt-auto grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 p-0">
                {tech.map(({ name, logo }) => (
                  <li
                    key={name}
                    data-testid="stack-tech"
                    className="flex items-center gap-3 rounded-panel border border-line bg-page p-3"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn border border-line bg-white">
                      <TechLogo id={logo} size={26} />
                    </span>
                    <span className="text-sm leading-snug font-bold text-body">{name}</span>
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>

      <section aria-labelledby="flow-title" className={`${section} flex flex-col gap-6 px-6 py-8`}>
        <h2 id="flow-title" className="m-0 text-center text-[28px] leading-9 font-bold text-navy-600">
          การทำงานของระบบ
        </h2>
        <ol className="m-0 flex list-none flex-col items-center justify-center gap-3 p-0 md:flex-row md:gap-4">
          {FLOW.map(({ title, detail, logo }, index) => (
            <li key={title} className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
              {index > 0 && <ArrowRightIcon size={24} className="rotate-90 text-line-strong md:rotate-0" />}
              <div className="flex w-56 flex-col items-center gap-2 rounded-card bg-brand-soft px-4 py-5 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-white text-navy-600">
                  {logo ? <TechLogo id={logo} size={24} /> : <UserIcon size={24} strokeWidth={1.75} />}
                </span>
                <span className="text-base font-bold">{title}</span>
                <span className="text-sm text-muted">{detail}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="m-0 text-center text-sm text-muted">
          ตะกร้าเก็บในเบราว์เซอร์ของผู้ใช้ · สินค้าและคำสั่งซื้อเก็บในฐานข้อมูล
        </p>
      </section>

      <p className="m-0 text-center text-[13px] text-muted">
        โลโก้เป็นเครื่องหมายการค้าของเจ้าของแต่ละราย ใช้เพื่อระบุเทคโนโลยีที่ร้านนี้ใช้เท่านั้น
      </p>
    </main>
  );
}
