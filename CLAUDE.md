# PLA Premium Shop — notes for Claude

Phillip Life (PLA) branded-merchandise ("ของพรีเมียม") shop. MVP converted from a
Claude Design prototype. **All products, prices and stock are mock data.**

@AGENTS.md

## Stack

- **Next.js 16** (App Router, Turbopack, `cacheComponents` + `partialPrefetching` on) + **TypeScript** (strict)
- **Tailwind CSS v4** — tokens from the "PLA Shop" design system live in `app/globals.css` `@theme`
  (default Tailwind colours are cleared). Look and feel: Apple-Store-style storefront in PhillipLife colours.
- **Prisma 6 + PostgreSQL** — Supabase in production, any Postgres locally; schema `prisma/schema.prisma`
- **Vercel** hosting — build runs `npm run vercel-build`; step-by-step in `docs/deploy.md`
- **zod** for request validation (`lib/validation.ts`)
- **Playwright** e2e tests in `e2e-test/`
- npm only (no yarn/pnpm)

## Commands

```bash
npm install                 # also runs `prisma generate` (postinstall)
cp .env.example .env        # then fill DATABASE_URL, DIRECT_URL, ADMIN_PASSWORD
npx prisma migrate dev      # create/apply migrations
npx prisma db seed          # WIPES products + orders, re-seeds sample products
npm run db:bootstrap        # inserts sample products only if the table is empty
npm run dev                 # http://localhost:3000
npm run build               # production build (must pass before pushing)
npm run lint
npx tsc --noEmit
npx playwright test         # e2e on a PRODUCTION build, port 3100; WIPES pla_e2e (or E2E_DATABASE_URL)
```

First-time Playwright on a new machine: `npx playwright install chromium`.

## Layout

```
app/
  layout.tsx                  SiteHeader + SiteFooter + BagDrawer on every page
  page.tsx                    /            showcase tiles, category circles, grid filtered by ?cat=
  _components/Showcase.tsx    home showcase (featured ids: HOME_SHOWCASE in lib/shop.ts)
  products/[id]/page.tsx      /products/x  server loader + details + related products
  products/[id]/ProductDetail.tsx          swatches/size chips, stock status, sticky buy bar,
                                           phone bottom bar + option sheet (<dialog>)
  tech-stack/page.tsx         /tech-stack  static "Tech stack" summary (linked from header, mobile menu, footer)
  cart/page.tsx               /cart
  checkout/page.tsx           /checkout    address + shipping + payment, creates order
  admin/page.tsx              /admin       tabs: สินค้า (edit) / คำสั่งซื้อ (table); login required
  admin/login/                /admin/login single-password login form
  api/admin/session/route.ts  POST login (sets cookie), DELETE logout
  api/products/...            GET list, GET/PUT one
  api/orders/route.ts         GET list, POST create
  api/log/route.ts            POST click log batch (public, no auth; stores into ClickLog)
components/                   shared UI: SiteHeader (frosted, categories, no Admin link), SiteFooter,
                              MobileMenu, CartButton, BagDrawer (<dialog>), BuyButton, ProductCard,
                              ProductImage, icons.tsx, ui.ts class recipes
lib/
  shop.ts                     DTO types + constants (shipping, payment, status labels) — client-safe
  products.ts, orders.ts      server data access (Prisma); always `await connection()` first
  validation.ts               zod schemas shared by API and forms
  cart.ts                     client cart in localStorage key `pla.cart` + Bag drawer state
                              (addToBag = add + open drawer)
  admin-auth.ts               signed session cookie for admin (ADMIN_PASSWORD)
  admin-actions.ts            Server Actions: loginAction / logoutAction (used by the UI)
instrumentation-client.ts     click log for EVERY button/link (document click listener -> console.debug + POST /api/log)
proxy.ts                      redirects signed-out visitors from /admin (Next 16 "proxy" = old middleware)
public/products/              product illustrations (SVG, from the Claude Design prototype)
docs/openapi.yml              API contract — update it FIRST when changing an endpoint
prisma/                       schema, migrations, sample-products.ts, seed.ts (wipe), bootstrap.ts (if empty)
docs/deploy.md                Supabase + Vercel guide (Thai)
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
- **Brand rules (PLA Shop design system):** navy `navy-600` for headings, links and selected
  states. `orange-500` is the ONE call-to-action fill per view (`buttonPrimary`), always with
  navy text — never white on orange, never orange text on white (orange words use
  `accent-text`). Secondary actions are `buttonSecondary` (brand-soft pill). Pill buttons;
  flat cards `rounded-card` (16px) with a `line` hairline, `shadow-hover` on hover only;
  sections `rounded-section` (20px); option chips 2px navy edge on `brand-soft` when selected
  (`pill()`); focus ring 3px navy. Frosted sticky bars use `bg-frosted`. Circle "discs" in
  orange/navy at 28–90% are the decorative motif. No emoji.
- **Buying:** `BuyButton` adds single-option products straight to the Bag drawer; products with
  more than one option link to the product page so the shopper picks colour/size.
  `stockStatus()` shows "เหลือเพียง N ชิ้น" at ≤ `LOW_STOCK_THRESHOLD` (10).
- **Tests:** with Cache Components, Next keeps previous routes mounted but hidden
  (React `<Activity>`), so in Playwright scope `getByTestId` with `.filter({ visible: true })`.
- **Secrets:** `.env` is gitignored; `.env.example` documents every variable. Never commit
  connection strings or passwords. Never run `prisma db seed` or the e2e tests against Supabase.
- **Admin auth:** every admin Route Handler calls `isAdminRequest()` itself — `proxy.ts` only
  redirects pages. New admin endpoints must do the same and declare `adminSession` in OpenAPI.
- **Crossing the login boundary:** log in/out through the Server Actions in
  `lib/admin-actions.ts` (set cookie + `redirect()`), never `fetch` + `router.push`. A `<Link>`
  to `/admin` prefetched while signed out caches proxy.ts's redirect, and a client navigation
  after login would reuse it (bug fixed 2026-11). The shop has no link to `/admin` at all;
  if you add one, make it a plain `<a>`.
  Prefetching only happens in production, which is why e2e runs on `next build && next start`.
- **Click log:** logging lives ONLY in `instrumentation-client.ts` (one capture-phase listener on
  `document`). Do not add per-button `onClick` logging. Never log typed text, IP, user agent or
  session ids, never call `preventDefault`/`stopPropagation` there, and never throw. The
  `ClickLog` table has RLS enabled; `prisma db seed` wipes it. Playwright cannot read
  `sendBeacon` bodies, so tests assert on rows in the e2e database.
- **Migrations:** create with `npx prisma migrate dev --name <change>`; never edit an applied
  migration. Supabase-only SQL (e.g. RLS) goes in a hand-written migration.
