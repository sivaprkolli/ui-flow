import { NextResponse } from "next/server";
import { addOrReuseVariable, getVariables } from "@/lib/variable-registry-store";

export async function GET(_: Request, { params }: { params: { testCaseId: string } }) {
  try { return NextResponse.json({ testCaseId: params.testCaseId, variables: getVariables(params.testCaseId) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 404 }); }
}

export async function POST(request: Request, { params }: { params: { testCaseId: string } }) {
  try { return NextResponse.json(addOrReuseVariable(params.testCaseId, await request.json()), { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid variable" }, { status: 400 }); }
}
