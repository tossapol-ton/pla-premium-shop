import { connection } from "next/server";
import type { Product as ProductRow } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_OPTION, type Product } from "@/lib/shop";
import type { ProductUpdateInput } from "@/lib/validation";

export function parseOptions(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (Array.isArray(value)) {
      const options = value.filter((item): item is string => typeof item === "string" && item.length > 0);
      if (options.length > 0) return options;
    }
  } catch {
    // fall through to default
  }
  return [DEFAULT_OPTION];
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    options: parseOptions(row.options),
    stock: row.stock,
    tag: row.tag && row.tag.length > 0 ? row.tag : null,
    imageUrl: row.imageUrl && row.imageUrl.length > 0 ? row.imageUrl : null,
  };
}

// Every read calls connection() first so Next.js never runs the query at build
// time (Cache Components would otherwise try to prerender it).

export async function listProducts(category?: string): Promise<Product[]> {
  await connection();
  const rows = await prisma.product.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  await connection();
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? toProduct(row) : null;
}

export async function updateProduct(id: string, input: ProductUpdateInput): Promise<Product | null> {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return null;

  const options = Array.from(new Set(input.options));
  const row = await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      tag: input.tag && input.tag.length > 0 ? input.tag : null,
      options: JSON.stringify(options.length > 0 ? options : [DEFAULT_OPTION]),
    },
  });
  return toProduct(row);
}
