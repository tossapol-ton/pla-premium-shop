import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { clickLogBatchSchema, toIssues } from "@/lib/validation";

const MAX_BODY_BYTES = 8 * 1024;

// POST /api/log — public; stores basic click data (see docs/openapi.yml).
export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return jsonError(400, "ข้อมูลใหญ่เกินไป");

  const parsed = clickLogBatchSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "ข้อมูล log ไม่ถูกต้อง", toIssues(parsed.error));

  for (const event of parsed.data.events) {
    console.info("[click]", event.type, event.label, event.href ?? "-", event.page);
  }
  await prisma.clickLog.createMany({
    data: parsed.data.events.map((event) => ({
      type: event.type,
      label: event.label,
      href: event.href ?? null,
      page: event.page,
      disabled: event.disabled ?? false,
      clickedAt: new Date(event.at),
    })),
  });
  return new NextResponse(null, { status: 204 });
}
