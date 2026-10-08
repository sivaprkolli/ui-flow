import { NextResponse } from "next/server";
import { resolveVariables } from "@/lib/variable-registry-store";

export async function POST(request: Request, { params }: { params: { testCaseId: string } }) {
  try { const body = await request.json().catch(() => ({})); return NextResponse.json(resolveVariables(params.testCaseId, body.environment ?? "QA")); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 404 }); }
}
