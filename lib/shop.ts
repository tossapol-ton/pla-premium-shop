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
