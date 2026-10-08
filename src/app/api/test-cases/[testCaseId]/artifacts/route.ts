import { NextResponse } from "next/server";
import { getArtifacts } from "@/lib/variable-registry-store";

export async function GET(_: Request, { params }: { params: { testCaseId: string } }) {
  try { return NextResponse.json(getArtifacts(params.testCaseId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 404 }); }
}
