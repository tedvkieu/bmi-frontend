import { proxyRequest } from "@/app/api/_utils/proxy";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return proxyRequest(req as any, `/api/evaluations/form/save-document`);
}
