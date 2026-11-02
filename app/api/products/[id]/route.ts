import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api";
import { getProduct, updateProduct } from "@/lib/products";
import { productUpdateSchema, toIssues } from "@/lib/validation";

// GET /api/products/{id}
export async function GET(_request: Request, ctx: RouteContext<"/api/products/[id]">) {
  const { id } = await ctx.params;
  const product = await getProduct(id);
  if (!product) return jsonError(404, "ไม่พบสินค้า");
  return NextResponse.json({ product });
}

// PUT /api/products/{id}  (admin — no auth yet)
export async function PUT(request: Request, ctx: RouteContext<"/api/products/[id]">) {
  const { id } = await ctx.params;
  const parsed = productUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "ข้อมูลสินค้าไม่ถูกต้อง", toIssues(parsed.error));

  const product = await updateProduct(id, parsed.data);
  if (!product) return jsonError(404, "ไม่พบสินค้า");
  return NextResponse.json({ product });
}
