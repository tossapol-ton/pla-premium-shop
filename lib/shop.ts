// Shared shop constants and DTO types. Safe to import from client and server.

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // whole THB
  category: string;
  options: string[];
  stock: number;
  tag: string | null;
  imageUrl: string | null; // e.g. "/products/umbrella.svg"
};

export const SHIPPING_METHODS = {
  standard: { label: "มาตรฐาน", eta: "3–5 วันทำการ", fee: 50 },
  express: { label: "ด่วน", eta: "1–2 วันทำการ", fee: 90 },
} as const;
export type ShippingMethod = keyof typeof SHIPPING_METHODS;
export const SHIPPING_METHOD_IDS = ["standard", "express"] as const satisfies readonly ShippingMethod[];

export const PAYMENT_METHODS = {
  promptpay: { label: "PromptPay QR", short: "PromptPay", hint: "สแกนจ่ายหลังยืนยันคำสั่งซื้อ (จำลอง)" },
  cod: { label: "เก็บเงินปลายทาง", short: "ปลายทาง", hint: "ชำระเมื่อได้รับสินค้า" },
} as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;
export const PAYMENT_METHOD_IDS = ["promptpay", "cod"] as const satisfies readonly PaymentMethod[];

export const ORDER_STATUS = {
  PENDING_PAYMENT: "รอชำระเงิน",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;

export type Address = {
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  postalCode: string;
};

export type OrderItem = {
  productId: string;
  productName: string;
  option: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  number: string;
  status: OrderStatus;
  createdAt: string; // ISO 8601
  address: Address;
  shippingMethod: ShippingMethod;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  subtotal: number;
  total: number;
  itemCount: number;
  items: OrderItem[];
};

export const DEFAULT_OPTION = "มาตรฐาน";

export function isShippingMethod(value: string): value is ShippingMethod {
  return value in SHIPPING_METHODS;
}

export function isPaymentMethod(value: string): value is PaymentMethod {
  return value in PAYMENT_METHODS;
}

export function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS;
}

// ---------------------------------------------------------------------------
// Presentation helpers (client-safe)

/** Stock at or below this shows "เหลือเพียง N ชิ้น". */
export const LOW_STOCK_THRESHOLD = 10;

export type StockStatus = { kind: "in" | "low" | "out"; label: string };

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return { kind: "out", label: "สินค้าหมด" };
  if (stock <= LOW_STOCK_THRESHOLD) return { kind: "low", label: `เหลือเพียง ${stock} ชิ้น` };
  return { kind: "in", label: "มีสินค้า พร้อมส่ง" };
}

/** Swatch colours for colour options. Options not listed here render as text chips. */
export const OPTION_COLORS: Readonly<Record<string, string>> = {
  กรมท่า: "#00317a",
  ส้ม: "#f7941d",
  ขาว: "#ffffff",
  ครีม: "#f3ead8",
  เทา: "#8a94a6",
};

const SIZE_OPTIONS = new Set(["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"]);

export type OptionKind = "color" | "size" | "other";

/** What the option list represents, so the UI can say "สี" / "ไซซ์" / "ตัวเลือก". */
export function optionKind(options: readonly string[]): OptionKind {
  if (options.length > 0 && options.every((o) => o in OPTION_COLORS)) return "color";
  if (options.length > 0 && options.every((o) => SIZE_OPTIONS.has(o.toUpperCase()))) return "size";
  return "other";
}

export const OPTION_KIND_LABEL: Readonly<Record<OptionKind, string>> = {
  color: "สี",
  size: "ไซซ์",
  other: "ตัวเลือก",
};

/** Products featured on the home page showcase (by id; missing ids are skipped). */
export const HOME_SHOWCASE = {
  hero: "giftset",
  dark: "polo",
  duo: ["umbrella", "tumbler"],
} as const;

export function categoryHref(category: string): string {
  return `/?cat=${encodeURIComponent(category)}#shop`;
}
