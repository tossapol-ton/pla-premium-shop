import { connection } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeOptions } from "@/lib/products";
import {
  isOrderStatus,
  isPaymentMethod,
  isShippingMethod,
  SHIPPING_METHODS,
  type Order,
} from "@/lib/shop";
import type { OrderCreateInput } from "@/lib/validation";

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

function toOrder(row: OrderWithItems): Order {
  const items = row.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    option: item.option,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.unitPrice * item.quantity,
  }));
  return {
    number: row.number,
    status: isOrderStatus(row.status) ? row.status : "PENDING_PAYMENT",
    createdAt: row.createdAt.toISOString(),
    address: {
      recipientName: row.recipientName,
      phone: row.phone,
      address: row.address,
      province: row.province,
      postalCode: row.postalCode,
    },
    shippingMethod: isShippingMethod(row.shippingMethod) ? row.shippingMethod : "standard",
    shippingFee: row.shippingFee,
    paymentMethod: isPaymentMethod(row.paymentMethod) ? row.paymentMethod : "promptpay",
    subtotal: row.subtotal,
    total: row.total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
  };
}

export async function listOrders(): Promise<Order[]> {
  await connection();
  const rows = await prisma.order.findMany({
    include: { items: { orderBy: { id: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toOrder);
}

/** Business-rule failure that maps to HTTP 409. */
export class OrderConflictError extends Error {}

function bangkokYear(date: Date): number {
  const year = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "Asia/Bangkok" }).format(date);
  return Number(year);
}

async function nextOrderNumber(tx: Prisma.TransactionClient, year: number): Promise<string> {
  const prefix = `PLA-${year}-`;
  const last = await tx.order.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const lastSeq = last ? Number(last.number.slice(prefix.length)) : 0;
  const seq = lastSeq + 1;
  if (seq > 99_999) throw new Error("Order number range exhausted for this year");
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

/**
 * Creates an order in one transaction: validates products/options/stock using
 * database prices, decrements stock, and writes the order with a running number.
 */
export async function createOrder(input: OrderCreateInput): Promise<Order> {
  // Merge duplicate lines (same product + option).
  const lines = new Map<string, { productId: string; option: string; quantity: number }>();
  for (const item of input.items) {
    const key = `${item.productId}\u0000${item.option}`;
    const existing = lines.get(key);
    if (existing) existing.quantity += item.quantity;
    else lines.set(key, { ...item });
  }

  const shipping = SHIPPING_METHODS[input.shippingMethod];

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const row = await prisma.$transaction(async (tx) => {
        const productIds = Array.from(new Set(Array.from(lines.values(), (line) => line.productId)));
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });
        const byId = new Map(products.map((product) => [product.id, product]));

        const qtyByProduct = new Map<string, number>();
        const items: Prisma.OrderItemCreateWithoutOrderInput[] = [];
        for (const line of lines.values()) {
          const product = byId.get(line.productId);
          if (!product) throw new OrderConflictError(`ไม่พบสินค้า ${line.productId}`);
          if (!normalizeOptions(product.options).includes(line.option)) {
            throw new OrderConflictError(`ตัวเลือก "${line.option}" ของ ${product.name} ไม่มีแล้ว`);
          }
          qtyByProduct.set(product.id, (qtyByProduct.get(product.id) ?? 0) + line.quantity);
          items.push({
            product: { connect: { id: product.id } },
            productName: product.name,
            option: line.option,
            unitPrice: product.price,
            quantity: line.quantity,
          });
        }

        for (const [productId, quantity] of qtyByProduct) {
          // Conditional decrement guards against overselling under concurrency.
          const updated = await tx.product.updateMany({
            where: { id: productId, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });
          if (updated.count === 0) {
            const product = byId.get(productId);
            throw new OrderConflictError(
              `${product?.name ?? productId} คงเหลือไม่พอ (เหลือ ${product?.stock ?? 0} ชิ้น)`,
            );
          }
        }

        const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const now = new Date();
        return tx.order.create({
          data: {
            number: await nextOrderNumber(tx, bangkokYear(now)),
            status: "PENDING_PAYMENT",
            recipientName: input.address.recipientName,
            phone: input.address.phone,
            address: input.address.address,
            province: input.address.province,
            postalCode: input.address.postalCode,
            shippingMethod: input.shippingMethod,
            shippingFee: shipping.fee,
            paymentMethod: input.paymentMethod,
            subtotal,
            total: subtotal + shipping.fee,
            createdAt: now,
            items: { create: items },
          },
          include: { items: { orderBy: { id: "asc" } } },
        });
      });
      return toOrder(row);
    } catch (error: unknown) {
      // Two checkouts raced for the same order number: retry with the next one.
      const isUniqueClash =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isUniqueClash || attempt === 2) throw error;
    }
  }
  throw new Error("unreachable");
}
