// app/api/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { processSyncLogic } from "@/lib/sync";

export async function POST(req: NextRequest) {
  let body: { url?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url } = body;
  if (!url) {
    return NextResponse.json({ error: "Missing Reclub URL" }, { status: 400 });
  }

  try {
    const result = await processSyncLogic(url, "TGR");
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
