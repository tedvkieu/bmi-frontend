import { proxyRequest } from "../../../_utils/proxy";

export async function GET(request: Request) {
  return proxyRequest(request, "/api/evaluations/categories/all");
}

