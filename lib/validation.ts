import { z } from "zod";
import { PAYMENT_METHOD_IDS, SHIPPING_METHOD_IDS } from "@/lib/shop";

// Request-body schemas. Keep in sync with docs/openapi.yml.

export const addressSchema = z
  .object({
    recipientName: z.string().trim().min(1, "กรุณากรอกชื่อผู้รับ").max(120),
    phone: z
      .string()
      .trim()
      .regex(/^0\d{8,9}$/, "กรุณากรอกเบอร์โทรศัพท์ 9–10 หลัก ขึ้นต้นด้วย 0"),
    address: z.string().trim().min(1, "กรุณากรอกที่อยู่").max(300),
    province: z.string().trim().min(1, "กรุณากรอกจังหวัด").max(80),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{5}$/, "กรุณากรอกรหัสไปรษณีย์ 5 หลัก"),
  })
  .strict();

export const orderCreateSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            option: z.string().min(1),
            quantity: z.number().int().min(1).max(999),
          })
          .strict(),
      )
      .min(1, "ตะกร้าว่าง")
      .max(50),
    address: addressSchema,
    shippingMethod: z.enum(SHIPPING_METHOD_IDS),
    paymentMethod: z.enum(PAYMENT_METHOD_IDS),
  })
  .strict();
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

export const productUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า").max(120),
    description: z.string().trim().max(1000),
    price: z.number().int("ราคาต้องเป็นจำนวนเต็ม").min(0).max(1_000_000),
    stock: z.number().int("สต็อกต้องเป็นจำนวนเต็ม").min(0).max(1_000_000),
    tag: z.string().trim().max(30).nullable(),
    options: z.array(z.string().trim().min(1).max(40)).max(20),
  })
  .strict();
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export type FieldIssue = { path: string; message: string };

export function toIssues(error: z.ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

/** Parses "กรมท่า, ส้ม ,, ขาว" -> ["กรมท่า", "ส้ม", "ขาว"] (deduplicated). */
export function parseOptionsText(text: string): string[] {
  const parts = text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return Array.from(new Set(parts));
}
