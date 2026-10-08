import { NextResponse } from "next/server";
import { getVariableOrThrow, updateVariable } from "@/lib/variable-registry-store";

export async function GET(_: Request, { params }: { params: { variableId: string } }) {
  try { return NextResponse.json(getVariableOrThrow(params.variableId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 404 }); }
}

export async function PUT(request: Request, { params }: { params: { variableId: string } }) {
  try { return NextResponse.json(updateVariable(params.variableId, await request.json())); }
  catch (error) { const message = error instanceof Error ? error.message : "Invalid update"; return NextResponse.json({ error: message }, { status: message.includes("immutable") ? 409 : 400 }); }
}
