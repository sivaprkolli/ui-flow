import { NextResponse } from "next/server";
import { getVariableUsage } from "@/lib/variable-registry-store";

export async function GET(_: Request, { params }: { params: { variableId: string } }) {
  try { return NextResponse.json(getVariableUsage(params.variableId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 404 }); }
}
