import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(req: NextRequest) {
  return proxyRequest(req as any, `/api/evaluations/form/submit`);
}
