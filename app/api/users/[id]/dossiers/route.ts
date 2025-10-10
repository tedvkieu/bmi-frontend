import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const search = new URL(request.url).search;
  const { id } = await params;
  return proxyRequest(request, `/api/users/${id}/dossiers${search || ""}`);
}
