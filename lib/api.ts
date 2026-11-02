import { NextResponse } from "next/server";
import type { FieldIssue } from "@/lib/validation";

export function jsonError(status: number, error: string, issues?: FieldIssue[]): NextResponse {
  return NextResponse.json(issues ? { error, issues } : { error }, { status });
}

/** Reads a JSON body, returning `undefined` when it is missing or malformed. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return (await request.json()) as unknown;
  } catch {
    return undefined;
  }
}
