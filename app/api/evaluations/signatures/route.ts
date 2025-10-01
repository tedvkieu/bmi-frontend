import { NextRequest } from "next/server";
import { proxyRequest } from "../../_utils/proxy";

export async function GET(request: NextRequest) {
  const search = new URL(request.url).search || "";
  return proxyRequest(request, `/api/evaluations/signatures${search}`);
}

export async function POST(request: Request) {
  return proxyRequest(request, "/api/evaluations/signatures");
}

