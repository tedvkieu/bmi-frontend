import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "../../_utils/proxy";

export async function GET(req: NextRequest) {
  const search = new URL(req.url).search || "";
  const registerNo = new URL(req.url).searchParams.get("registerNo");
  if (!registerNo) {
    return NextResponse.json({ error: "Missing registerNo param" }, { status: 400 });
  }
  return proxyRequest(req as any, `/api/dossiers/search${search}`);
}
