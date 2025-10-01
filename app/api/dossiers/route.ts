import { NextRequest } from "next/server";
import { proxyRequest } from "../_utils/proxy";

export async function POST(req: NextRequest) {
  return proxyRequest(req as any, "/api/dossiers");
}

export async function GET(req: NextRequest) {
  const search = new URL(req.url).search || "";
  return proxyRequest(req as any, `/api/dossiers${search}`);
}
