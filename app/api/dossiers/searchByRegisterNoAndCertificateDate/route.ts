import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "../../_utils/proxy";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const registerNo = url.searchParams.get("registerNo");
  if (!registerNo) {
    return NextResponse.json({ error: "Missing registerNo param" }, { status: 400 });
  }
  const search = url.search || "";
  return proxyRequest(
    req as any,
    `/api/dossiers/searchByRegisterNoAndCertificateDate${search}`
  );
}
