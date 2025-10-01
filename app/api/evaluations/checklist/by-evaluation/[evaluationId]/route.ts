import { NextRequest } from "next/server";
import { proxyRequest } from "../../../../_utils/proxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ evaluationId: string }> }) {
  const { evaluationId } = await params;
  const search = new URL(request.url).search || "";
  return proxyRequest(request, `/api/evaluations/checklist/by-evaluation/${evaluationId}${search}`);
}
