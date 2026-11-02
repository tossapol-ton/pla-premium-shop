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
| Admin | `/admin` | ต้องเข้าสู่ระบบด้วยรหัสผ่าน · แท็บ "สินค้า" แก้ไขสินค้า · แท็บ "คำสั่งซื้อ" ดูรายการคำสั่งซื้อ |

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6 + PostgreSQL (Supabase) · zod · Playwright · Vercel

API: REST under `/api/*`, described in [`docs/openapi.yml`](docs/openapi.yml) (OpenAPI 3.1).

## Deploy (Supabase + Vercel)

ทำผ่านเบราว์เซอร์ทั้งหมด ไม่ต้องติดตั้งอะไรในเครื่อง — ดูคู่มือทีละขั้นที่
**[`docs/deploy.md`](docs/deploy.md)** (มี checklist ตรวจรับและวิธีแก้ปัญหา)

## Local development

Requires Node.js 20+, npm and a PostgreSQL database (local Postgres, or a separate Supabase
project for development — **not** the production one).

```bash
npm install
```

```bash
cp .env.example .env
```

Edit `.env`: set `DATABASE_URL` and `DIRECT_URL` (for local Postgres both can be
`postgresql://postgres:postgres@localhost:5432/pla_dev`) and `ADMIN_PASSWORD`.

```bash
npx prisma migrate dev
```

```bash
npx prisma db seed
```

```bash
npm run dev
```

Open http://localhost:3000. Admin: http://localhost:3000/admin (password = `ADMIN_PASSWORD`).

`npx prisma db seed` **wipes** all products and orders and loads the 8 sample products again.
`npm run db:bootstrap` only inserts the sample products when the table is empty (used on deploy).

### Tests

```bash
npx playwright install chromium
```

```bash
npx playwright test
```

The tests build and start the app in **production mode** on port 3100 (link prefetching only
happens in production) against a **separate database that they wipe**:
by default `postgresql://postgres:postgres@localhost:5432/pla_e2e` (create it with
`createdb pla_e2e`), or set `E2E_DATABASE_URL`. The config refuses Supabase URLs so tests can never
wipe production.

| Test | What it checks |
| --- | --- |
| customer orders 3 products… | Product images load; adds 3 products (2 from the grid, polo size L × 2 from the product page); cart total ฿1,820; empty-form errors; random address; express + COD total ฿1,910; order number `PLA-<year>-<5 digits>` and status รอชำระเงิน; stock decremented; admin login reached via the header link after browsing; order row in **Admin → คำสั่งซื้อ**; logout |
| admin pages and admin API need a login | `/admin` redirects to login; wrong password rejected; `GET /api/orders` and `PUT /api/products/{id}` return 401 without a session, 200 with one, 401 again after logout |

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
- **Admin login:** one shared password (`ADMIN_PASSWORD`). Logging in sets an HttpOnly, signed
  session cookie (8 hours). `proxy.ts` redirects signed-out visitors from `/admin`; the admin API
  routes and the admin page also check the session themselves.

## What is still mock / not done

| Area | Status |
| --- | --- |
| **Authentication** | **Basic only.** One shared admin password, no individual accounts, roles, audit log or rate limiting. Replace with real accounts (e.g. Supabase Auth) before real use. Shoppers do not log in. |
| **Payment** | No real payment. "PromptPay QR" only records the choice; no QR is generated and no money moves. Every order stays `รอชำระเงิน`. |
| **Product images** | Illustrations (SVG) drawn in the Claude Design prototype, stored in `public/products/` and linked by `Product.imageUrl`. They are not product photos — the UI says so. No image upload yet; admin cannot change images. A product with no `imageUrl` falls back to the brand-mark placeholder. |
| **Product data** | Sample products, prices and stock from the prototype. |
| Order management | Admin can view orders but not change status, cancel or refund (cancel would need to return stock). |
| Product management | Edit only — no create/delete, no category editing. The prototype's "คืนค่าสินค้าทั้งหมด" button is replaced by `npx prisma db seed`. |
| Customer accounts | None; no order history or tracking page for customers. |
| Notifications | No email/SMS confirmation. |
| Personal data | Recipient name, phone and address are stored in plain text in Supabase (Singapore — data leaves Thailand). Testers must use made-up data. Before real use, review PDPA requirements (consent, cross-border transfer, retention, access control). |
| Database | PostgreSQL. Production on Supabase (Singapore region) with Row Level Security enabled so Supabase's Data API cannot read the tables. No backups configured beyond Supabase's plan defaults. |

## Brand

PhillipLife design system tokens are in the Tailwind theme (`app/globals.css`): navy primary
`#00317B` (hover `#0A45A0`), deep navy `#001129`/`#001B47`, orange accent `#EB8600` (badges and
keylines only), greys `#F4F6F9` / `#E9ECF1` / `#D9DEE6`, muted text `#595959`. Arial for Latin with
Noto Sans Thai for Thai. Card radius 18px, button radius 10px. Logo files in `public/` come from
the design system; product illustrations in `public/products/` come from the prototype.

To add or replace a product image: put the file in `public/products/`, set `imageUrl` for that
product in `prisma/seed.ts`, then run `npx prisma db seed`.
