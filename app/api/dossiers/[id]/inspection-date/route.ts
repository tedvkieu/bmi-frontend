import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_utils/proxy";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(req as any, `/api/dossiers/${id}/inspection-date`);
}
