import { expect, test, type Page } from "@playwright/test";

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

test("customer orders 3 products and the order appears in admin", async ({ page }) => {
  const stockBefore = {
    umbrella: await stockOf(page, "umbrella"),
    tote: await stockOf(page, "tote"),
    polo: await stockOf(page, "polo"),
  };

  // 1) Product list: add two products straight from the grid.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "สินค้าทั้งหมด" })).toBeVisible();
  await expect(page.getByText("ข้อมูลตัวอย่าง")).toBeVisible();

  // Every product card shows its illustration and the file actually loads.
  const cardImages = page.locator('[data-testid="product-card"] img[src^="/products/"]').filter({ visible: true });
  await expect(cardImages).toHaveCount(8);
  const loaded = await cardImages.evaluateAll((imgs) =>
    imgs.every((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0),
  );
  expect(loaded).toBe(true);

  await page.getByRole("button", { name: "ใส่ตะกร้า ร่มพับอัตโนมัติ PLA" }).click();
  await expect(page.getByRole("status")).toContainText("ร่มพับอัตโนมัติ PLA");
  await page.getByRole("button", { name: "ใส่ตะกร้า กระเป๋าผ้า Tote" }).click();
  await expect.poll(() => cartCount(page)).toBe(2);

  // Sold-out product cannot be added.
  await expect(page.getByRole("button", { name: "พาวเวอร์แบงก์ 10,000 mAh สินค้าหมด" })).toBeDisabled();

  // 2) Product page: pick size L, quantity 2.
  await page.getByRole("link", { name: "ดูรายละเอียด เสื้อโปโล PLA" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "เสื้อโปโล PLA" })).toBeVisible();
  await expect(page.getByRole("img", { name: "เสื้อโปโล PLA" })).toHaveAttribute("src", "/products/polo.svg");
  await page.getByRole("button", { name: "L", exact: true }).click();
  await page.getByRole("button", { name: "เพิ่มจำนวน" }).click();
  await expect(visibleTestId(page, "qty")).toHaveText("2");
  await page.getByRole("button", { name: /^ใส่ตะกร้า/ }).click();
  await expect(page.getByRole("status")).toContainText("เพิ่ม 2 ชิ้น (L)");
  await expect.poll(() => cartCount(page)).toBe(4);

  // 3) Cart: three distinct lines.
  await visibleTestId(page, "cart-link").click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(visibleTestId(page, "cart-line")).toHaveCount(3);
  // 390 + 250 + 590*2 = 1,820
  await expect(visibleTestId(page, "cart-subtotal")).toHaveText("฿1,820");

  // 4) Checkout with random address data.
  await page.getByRole("link", { name: "ไปหน้าชำระเงิน" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "ชำระเงิน" })).toBeVisible();

  // Submitting empty shows required-field errors.
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
  // 1,820 + express 90
  await expect(visibleTestId(page, "checkout-total")).toHaveText("฿1,910");

  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();

  // 5) Success screen with a PLA-<year>-<5 digits> order number; cart is cleared.
  const success = visibleTestId(page, "order-success");
  await expect(success).toContainText("สั่งซื้อสำเร็จ");
  const orderNumber = await visibleTestId(page, "order-number").innerText();
  expect(orderNumber).toMatch(/^PLA-\d{4}-\d{5}$/);
  await expect(success).toContainText("รอชำระเงิน");
  await expect.poll(() => cartCount(page)).toBe(0);

  // Stock was decremented in the database.
  expect(await stockOf(page, "umbrella")).toBe(stockBefore.umbrella - 1);
  expect(await stockOf(page, "tote")).toBe(stockBefore.tote - 1);
  expect(await stockOf(page, "polo")).toBe(stockBefore.polo - 2);

  // 6) Admin > คำสั่งซื้อ shows the new order.
  await page.goto("/admin");
  await page.getByRole("tab", { name: /คำสั่งซื้อ/ }).click();
  const row = page.locator(`[data-testid="order-row"][data-order-number="${orderNumber}"]`).filter({ visible: true });
  await expect(row).toBeVisible();
  await expect(row).toContainText(address.recipientName);
  await expect(row).toContainText("ปลายทาง");
  await expect(row).toContainText("฿1,910");
  await expect(row).toContainText("รอชำระเงิน");
  await expect(row.locator("td").nth(3)).toHaveText("4");
});
