# PLA Premium Shop

ร้านของพรีเมียม PhillipLife (Phillip Life Assurance) — MVP ที่แปลงจาก Claude Design prototype
มาเป็นเว็บแอปจริงที่มีฐานข้อมูล

> **ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่าง (mock):** สินค้า ราคา สต็อก และคำสั่งซื้อ ใช้เพื่อการทดลองเท่านั้น

| หน้า | URL | ทำอะไร |
| --- | --- | --- |
| รายการสินค้า | `/` | Hero, กรองตามหมวดหมู่, การ์ดสินค้า, ปุ่มใส่ตะกร้า (ปิดเมื่อสินค้าหมด) |
| รายละเอียดสินค้า | `/products/[id]` | เลือกสี/ไซซ์, ปรับจำนวน (ไม่เกินสต็อก), ใส่ตะกร้า |
| ตะกร้า | `/cart` | เพิ่ม/ลด/ลบรายการ, ยอดรวม, ไปหน้าชำระเงิน |
| ชำระเงิน | `/checkout` | ที่อยู่จัดส่ง (บังคับทุกช่อง), วิธีจัดส่ง, วิธีชำระเงิน, ยืนยันคำสั่งซื้อ |
| Admin | `/admin` | แท็บ "สินค้า" แก้ไขสินค้า · แท็บ "คำสั่งซื้อ" ดูรายการคำสั่งซื้อ |

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6 + SQLite · zod · Playwright

API: REST under `/api/*`, described in [`docs/openapi.yml`](docs/openapi.yml) (OpenAPI 3.1).

## Setup

Requires Node.js 20+ and npm.

```bash
npm install
```

```bash
npx prisma migrate dev
```

```bash
npx prisma db seed
```

```bash
npm run dev
```

Open http://localhost:3000.

`npx prisma migrate dev` creates `prisma/dev.db` and also runs the seed on first creation.
`npx prisma db seed` **wipes** all products and orders and loads the 8 sample products again —
use it any time to reset the shop.

### Tests

```bash
npx playwright install chromium
```

```bash
npx playwright test
```

The e2e test (`e2e-test/order.spec.ts`) starts its own dev server on port 3100 with a separate
database (`prisma/e2e.db`, reset on every run), so it never touches your dev data. It adds 3
products to the cart (2 from the grid, 1 from the product page with size L × 2), checks the cart
total, fills the checkout form with random data, confirms the order, checks stock was
decremented, and asserts the order appears in **Admin → คำสั่งซื้อ**.

Other checks: `npm run build`, `npm run lint`, `npx tsc --noEmit`.

## How it works

- **Products and orders live in the database** (`Product`, `Order`, `OrderItem` in
  `prisma/schema.prisma`).
- **The cart stays in the browser** (localStorage key `pla.cart`, as in the prototype). It stores
  only product id, option and quantity; names, prices and stock are always read from the database.
- **Placing an order** (`POST /api/orders`) runs in one transaction: re-reads prices from the
  database, checks options and stock, decrements stock (conditional update, so stock can't go
  negative), and creates the order with number `PLA-<year>-<5-digit running number>` and status
  `รอชำระเงิน`. Out of stock → HTTP 409 with a Thai message shown on the checkout page.
- Shipping: มาตรฐาน 3–5 วัน ฿50 / ด่วน 1–2 วัน ฿90. Payment: PromptPay QR / เก็บเงินปลายทาง.

## What is still mock / not done

| Area | Status |
| --- | --- |
| **Authentication** | **None.** `/admin`, `PUT /api/products/{id}` and `GET /api/orders` are open to anyone who can reach the server. Add login + role check before any shared deployment. |
| **Payment** | No real payment. "PromptPay QR" only records the choice; no QR is generated and no money moves. Every order stays `รอชำระเงิน`. |
| **Product images** | Placeholders (brand mark on a grey gradient). No image upload. |
| **Product data** | Sample products, prices and stock from the prototype. |
| Order management | Admin can view orders but not change status, cancel or refund (cancel would need to return stock). |
| Product management | Edit only — no create/delete, no category editing. The prototype's "คืนค่าสินค้าทั้งหมด" button is replaced by `npx prisma db seed`. |
| Customer accounts | None; no order history or tracking page for customers. |
| Notifications | No email/SMS confirmation. |
| Personal data | Recipient name, phone and address are stored in plain text in SQLite. Before real use, review PDPA requirements (consent, retention, access control). |
| Database | SQLite file for local development. For deployment (e.g. Vercel) switch to Postgres/Supabase — change `provider` in `prisma/schema.prisma`, set `DATABASE_URL` in `.env.local` / the host's env vars, and create a new migration. |

## Brand

PhillipLife design system tokens are in the Tailwind theme (`app/globals.css`): navy primary
`#00317B` (hover `#0A45A0`), deep navy `#001129`/`#001B47`, orange accent `#EB8600` (badges and
keylines only), greys `#F4F6F9` / `#E9ECF1` / `#D9DEE6`, muted text `#595959`. Arial for Latin with
Noto Sans Thai for Thai. Card radius 18px, button radius 10px. Logo files in `public/` come from
the design system.
