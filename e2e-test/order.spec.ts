import { expect, test, type Page } from "@playwright/test";
import { E2E_ADMIN_PASSWORD } from "../playwright.config";

// ---------- random test data ----------
const FIRST_NAMES = ["สมชาย", "สมหญิง", "วิภา", "ธนา", "กมล", "ปรีชา", "อรุณี", "ศักดิ์ชัย"];
const LAST_NAMES = ["ใจดี", "รักไทย", "มั่นคง", "ศรีสุข", "พึ่งบุญ", "แสงทอง"];
const PROVINCES = ["กรุงเทพมหานคร", "เชียงใหม่", "ขอนแก่น", "ภูเก็ต", "ชลบุรี", "สงขลา"];

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const digits = (count: number): string =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join("");

function randomAddress() {
  return {
    // Suffix makes the recipient unique so the admin assertion can't match an older order.
    recipientName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${digits(4)}`,
    phone: `08${digits(8)}`,
    address: `${1 + Math.floor(Math.random() * 999)}/${digits(2)} ถนนสุขุมวิท แขวงคลองเตย`,
    province: pick(PROVINCES),
    postalCode: `1${digits(4)}`,
  };
}

// With Cache Components, Next.js keeps recently visited routes mounted but hidden
// (React <Activity>), so test-id lookups must be scoped to visible elements.
const visibleTestId = (page: Page, id: string) => page.getByTestId(id).filter({ visible: true });

async function cartCount(page: Page): Promise<number> {
  return Number(await visibleTestId(page, "cart-count").innerText());
}

async function stockOf(page: Page, productId: string): Promise<number> {
  const response = await page.request.get(`/api/products/${productId}`);
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { product: { stock: number } };
  return body.product.stock;
}

const card = (page: Page, productId: string) =>
  page.locator(`[data-testid="product-card"][data-product-id="${productId}"]`).filter({ visible: true }).first();

const bag = (page: Page) => visibleTestId(page, "bag-drawer");

test("customer orders 3 products via the Bag drawer and the order appears in admin", async ({ page }) => {
  const stockBefore = {
    notebook: await stockOf(page, "notebook"),
    giftset: await stockOf(page, "giftset"),
    polo: await stockOf(page, "polo"),
  };

  // 1) Home: showcase + grid with illustrations, sample-data note.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "สินค้าทั้งหมด" })).toBeVisible();
  await expect(page.getByText("ข้อมูลตัวอย่าง").first()).toBeVisible();
  const cardImages = page.locator('[data-testid="product-card"] img[src^="/products/"]').filter({ visible: true });
  await expect(cardImages).toHaveCount(8);
  const loaded = await cardImages.evaluateAll((imgs) =>
    imgs.every((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0),
  );
  expect(loaded).toBe(true);
  // No Admin link in the shop header any more.
  await expect(page.getByRole("banner").getByRole("link", { name: "Admin" })).toHaveCount(0);

  // 2) Single-option products go straight into the Bag drawer.
  await card(page, "notebook").getByRole("button", { name: "ซื้อ ชุดสมุดโน้ตและปากกา" }).click();
  await expect(bag(page)).toBeVisible();
  await expect(bag(page).getByRole("heading", { name: "เพิ่มลงตะกร้าแล้ว" })).toBeVisible();
  await expect(visibleTestId(page, "bag-just-added")).toContainText("ชุดสมุดโน้ตและปากกา");
  await bag(page).getByRole("button", { name: "ปิดตะกร้า" }).click();
  await expect(bag(page)).toHaveCount(0);

  await card(page, "giftset").getByRole("button", { name: "ซื้อ ชุดของขวัญพรีเมียม" }).click();
  await expect(visibleTestId(page, "bag-line")).toHaveCount(2);
  await expect(visibleTestId(page, "bag-subtotal")).toHaveText("฿1,580");
  await page.keyboard.press("Escape"); // native <dialog> closes on Esc
  await expect(bag(page)).toHaveCount(0);
  await expect.poll(() => cartCount(page)).toBe(2);

  // Sold-out product cannot be bought.
  await expect(card(page, "powerbank").getByRole("button", { name: "พาวเวอร์แบงก์ 10,000 mAh สินค้าหมด" })).toBeDisabled();

  // 3) Multi-option products open the product page to choose a colour/size.
  await card(page, "umbrella").getByRole("link", { name: "ซื้อ ร่มพับอัตโนมัติ PLA (เลือกตัวเลือก)" }).click();
  await expect(page).toHaveURL(/\/products\/umbrella$/);
  await page.getByRole("button", { name: "สีส้ม" }).click();
  await expect(page.getByRole("button", { name: "สีส้ม" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("group", { name: /สี/ }).first()).toContainText("ส้ม");

  // 4) Header category link filters the home grid.
  await page.getByRole("navigation", { name: "หมวดสินค้า" }).getByRole("link", { name: "เสื้อผ้า" }).click();
  await expect(page).toHaveURL(/cat=/);
  await expect(page.getByRole("heading", { level: 2, name: "เสื้อผ้า" })).toBeVisible();
  await expect(page.locator('[data-testid="product-card"]').filter({ visible: true })).toHaveCount(1);

  // 5) Product page: pick size L, quantity 2, add → Bag drawer.
  await card(page, "polo").getByRole("link", { name: "ดูรายละเอียด เสื้อโปโล PLA" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "เสื้อโปโล PLA" })).toBeVisible();
  await expect(page.getByRole("img", { name: "เสื้อโปโล PLA" })).toHaveAttribute("src", "/products/polo.svg");
  await expect(visibleTestId(page, "stock-status")).toHaveText("มีสินค้า พร้อมส่ง");
  await page.getByRole("button", { name: "L", exact: true }).click();
  await page.getByRole("button", { name: "เพิ่มจำนวน" }).click();
  await expect(visibleTestId(page, "qty")).toHaveText("2");
  await page.getByRole("button", { name: "เพิ่มลงตะกร้า · ฿1,180" }).click();
  await expect(visibleTestId(page, "bag-just-added")).toContainText("ตัวเลือก: L · จำนวน 2");
  await expect(visibleTestId(page, "bag-line")).toHaveCount(3);
  // 290 + 1,290 + 590×2 = 2,760
  await expect(visibleTestId(page, "bag-subtotal")).toHaveText("฿2,760");
  await expect.poll(() => cartCount(page)).toBe(4);

  // 6) Drawer → cart page.
  await bag(page).getByRole("link", { name: "ดูตะกร้า" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(visibleTestId(page, "cart-line")).toHaveCount(3);
  await expect(visibleTestId(page, "cart-subtotal")).toHaveText("฿2,760");

  // 7) Checkout with random address data.
  await page.getByRole("link", { name: "ไปหน้าชำระเงิน" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "ชำระเงิน" })).toBeVisible();
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(page.getByText("กรุณากรอกชื่อผู้รับ")).toBeVisible();

  const address = randomAddress();
  await page.getByRole("textbox", { name: "ชื่อผู้รับ", exact: true }).fill(address.recipientName);
  await page.getByRole("textbox", { name: "เบอร์โทรศัพท์", exact: true }).fill(address.phone);
  await page.getByRole("textbox", { name: "ที่อยู่", exact: true }).fill(address.address);
  await page.getByRole("textbox", { name: "จังหวัด", exact: true }).fill(address.province);
  await page.getByRole("textbox", { name: "รหัสไปรษณีย์", exact: true }).fill(address.postalCode);
  await page.getByLabel(/ด่วน/).check();
  await page.getByLabel(/เก็บเงินปลายทาง/).check();
  // 2,760 + express 90
  await expect(visibleTestId(page, "checkout-total")).toHaveText("฿2,850");
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();

  // 8) Success: PLA-<year>-<5 digits>, cart cleared, stock decremented.
  const success = visibleTestId(page, "order-success");
  await expect(success).toContainText("สั่งซื้อสำเร็จ");
  const orderNumber = await visibleTestId(page, "order-number").innerText();
  expect(orderNumber).toMatch(/^PLA-\d{4}-\d{5}$/);
  await expect(success).toContainText("รอชำระเงิน");
  await expect.poll(() => cartCount(page)).toBe(0);
  expect(await stockOf(page, "notebook")).toBe(stockBefore.notebook - 1);
  expect(await stockOf(page, "giftset")).toBe(stockBefore.giftset - 1);
  expect(await stockOf(page, "polo")).toBe(stockBefore.polo - 2);

  // 9) Staff open /admin directly (no link in the shop), log in, see the order.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("รหัสผ่าน").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("tab", { name: /คำสั่งซื้อ/ }).click();
  const row = page.locator(`[data-testid="order-row"][data-order-number="${orderNumber}"]`).filter({ visible: true });
  await expect(row).toBeVisible();
  await expect(row).toContainText(address.recipientName);
  await expect(row).toContainText("ปลายทาง");
  await expect(row).toContainText("฿2,850");
  await expect(row).toContainText("รอชำระเงิน");
  await expect(row.locator("td").nth(3)).toHaveText("4");

  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test.describe("phone layout", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("full-screen menu, option sheet and no sideways scrolling", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    // Desktop category bar is hidden; the menu button opens the full-screen menu.
    await expect(page.getByRole("navigation", { name: "หมวดสินค้า" })).toBeHidden();
    await page.getByRole("button", { name: "เปิดเมนู" }).click();
    const menu = page.getByRole("navigation", { name: "เมนูหลัก" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "เสื้อผ้า" }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/cat=/);

    // Product with sizes: bottom bar opens the option sheet.
    await page.goto("/products/polo");
    await page.getByRole("button", { name: "เลือกไซซ์และซื้อ" }).click();
    const sheet = visibleTestId(page, "option-sheet");
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "M", exact: true }).click();
    await sheet.getByRole("button", { name: "เพิ่มลงตะกร้า · ฿590" }).click();
    await expect(sheet).toHaveCount(0);
    await expect(visibleTestId(page, "bag-just-added")).toContainText("ตัวเลือก: M · จำนวน 1");
    await page.keyboard.press("Escape");

    // Single-option product: bottom bar adds directly.
    await page.goto("/products/giftset");
    await page.getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true }).click();
    await expect(visibleTestId(page, "bag-just-added")).toContainText("ชุดของขวัญพรีเมียม");
    await expect(visibleTestId(page, "bag-line")).toHaveCount(2);
  });
});

test("admin pages and admin API need a login", async ({ page, request }) => {
  // Signed-out visitors are sent to the login page.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);

  // Wrong password is rejected.
  await page.getByLabel("รหัสผ่าน").fill("not-the-password");
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  // (Next.js' own route announcer also has role="alert", so match by text.)
  await expect(page.getByText("รหัสผ่านไม่ถูกต้อง")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);

  // Admin API without a session cookie -> 401; shopper API stays public.
  expect((await request.get("/api/orders")).status()).toBe(401);
  const update = await request.put("/api/products/umbrella", {
    data: { name: "x", description: "", price: 1, stock: 1, tag: null, options: [] },
  });
  expect(update.status()).toBe(401);
  expect((await request.get("/api/products")).status()).toBe(200);

  // After logging in, the session cookie unlocks the admin API; logout ends it.
  const login = await request.post("/api/admin/session", { data: { password: E2E_ADMIN_PASSWORD } });
  expect(login.status()).toBe(204);
  expect((await request.get("/api/orders")).status()).toBe(200);
  expect((await request.delete("/api/admin/session")).status()).toBe(204);
  expect((await request.get("/api/orders")).status()).toBe(401);
});
