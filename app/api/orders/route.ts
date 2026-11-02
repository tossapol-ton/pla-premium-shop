import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api";
import { isAdminRequest } from "@/lib/admin-auth";
import { createOrder, listOrders, OrderConflictError } from "@/lib/orders";
import { orderCreateSchema, toIssues } from "@/lib/validation";

// GET /api/orders  (admin only)
export async function GET() {
  if (!(await isAdminRequest())) return jsonError(401, "กรุณาเข้าสู่ระบบ Admin");
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

// POST /api/orders
export async function POST(request: Request) {
  const parsed = orderCreateSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "ข้อมูลคำสั่งซื้อไม่ถูกต้อง", toIssues(parsed.error));

  try {
    const order = await createOrder(parsed.data);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof OrderConflictError) return jsonError(409, error.message);
    throw error;
  }
}
