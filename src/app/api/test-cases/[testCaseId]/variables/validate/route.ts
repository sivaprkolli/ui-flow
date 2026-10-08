import { NextResponse } from "next/server";
import { validateVariables } from "@/lib/variable-registry-store";

export async function POST(_: Request, { params }: { params: { testCaseId: string } }) {
  try { const issues = validateVariables(params.testCaseId); return NextResponse.json({ testCaseId: params.testCaseId, valid: !issues.some((issue) => issue.severity === "error"), issues }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 404 }); }
}
