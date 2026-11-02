# PLA Premium Shop — notes for Claude

Phillip Life (PLA) branded-merchandise ("ของพรีเมียม") shop. MVP converted from a
Claude Design prototype. **All products, prices and stock are mock data.**

@AGENTS.md

## Stack

- **Next.js 16** (App Router, Turbopack, `cacheComponents` + `partialPrefetching` on) + **TypeScript** (strict)
- **Tailwind CSS v4** — brand tokens live in `app/globals.css` `@theme` (default Tailwind colours are cleared)
- **Prisma 6 + SQLite** — schema `prisma/schema.prisma`, DB file `prisma/dev.db` (gitignored)
- **zod** for request validation (`lib/validation.ts`)
- **Playwright** e2e tests in `e2e-test/`
- npm only (no yarn/pnpm)

## Commands

```bash
npm install                 # also runs `prisma generate` (postinstall)
npx prisma migrate dev      # create/apply migrations to prisma/dev.db
npx prisma db seed          # WIPES products + orders, re-seeds sample products
npm run dev                 # http://localhost:3000
npm run build               # production build (must pass before pushing)
npm run lint
npx tsc --noEmit
npx playwright test         # e2e; uses its own prisma/e2e.db on port 3100
```

First-time Playwright on a new machine: `npx playwright install chromium`.

## Layout

```
app/
  page.tsx                    /            product list (hero, category pills, grid)
  products/[id]/page.tsx      /products/x  detail (options, qty stepper)
  cart/page.tsx               /cart
  checkout/page.tsx           /checkout    address + shipping + payment, creates order
  admin/page.tsx              /admin       tabs: สินค้า (edit) / คำสั่งซื้อ (table)
  api/products/...            GET list, GET/PUT one
  api/orders/route.ts         GET list, POST create
components/                   shared UI (SiteHeader, Badge, ProductImage, ui.ts class recipes)
lib/
  shop.ts                     DTO types + constants (shipping, payment, status labels) — client-safe
  products.ts, orders.ts      server data access (Prisma); always `await connection()` first
  validation.ts               zod schemas shared by API and forms
  cart.ts                     client cart in localStorage key `pla.cart`
public/products/              product illustrations (SVG, from the Claude Design prototype)
docs/openapi.yml              API contract — update it FIRST when changing an endpoint
prisma/                       schema, migrations, seed.ts
e2e-test/                     Playwright specs
```

## Conventions

- **No `any`.** Use `unknown` + narrowing, zod, or Prisma types.
- **Server Components by default.** Add `"use client"` only for interactivity (forms, cart, tabs).
  Pattern: `page.tsx` (server) renders static shell + `<Suspense>` around an async loader that
  reads the DB and passes plain DTOs to a client component.
- **Cache Components:** any DB read must be request-time — call `connection()` (done inside
  `lib/products.ts` / `lib/orders.ts`) and render it under `<Suspense>`. Don't add
  `export const dynamic`/`revalidate`; they error with `cacheComponents`.
- **Thai UI copy** everywhere users see text (`<html lang="th">`). Code, comments, commit
  messages in English. Use correct terms: ตะกร้า, ชำระเงิน, คำสั่งซื้อ, ผู้รับ, สต็อก.
- **Money** is whole THB (`Int`). Format with `formatBaht()` from `lib/format.ts`.
  Prices for orders are always read from the DB, never trusted from the client.
- **API first:** change `docs/openapi.yml`, then `lib/validation.ts`, then the route handler.
- **Brand rules (PhillipLife DS):** navy `navy-600` primary (hover `navy-500`); orange is an
  accent for badges/keylines only — never orange text on white; cards `rounded-card` (18px),
  buttons `rounded-btn` (10px); shadows `shadow-card` / `shadow-raised`; hero `bg-hero`;
  no emoji.
- **Tests:** with Cache Components, Next keeps previous routes mounted but hidden
  (React `<Activity>`), so in Playwright scope `getByTestId` with `.filter({ visible: true })`.
- `.env` holds only non-secret defaults and is committed; secrets go in `.env.local`.
