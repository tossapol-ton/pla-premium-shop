import { NextResponse, type NextRequest } from "next/server";
import { listProducts } from "@/lib/products";

// GET /api/products?category=<name>
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const products = await listProducts(category || undefined);
  return NextResponse.json({ products });
}
