import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_utils/proxy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req as any, `/api/dossiers/${id}/machines`);
}
