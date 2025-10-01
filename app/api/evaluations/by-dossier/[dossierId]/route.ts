import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_utils/proxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ dossierId: string }> }) {
  const { dossierId } = await params;
  const search = new URL(request.url).search || "";
  return proxyRequest(request, `/api/evaluations/by-dossier/${dossierId}${search}`);
}
