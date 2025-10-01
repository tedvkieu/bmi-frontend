import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(request: Request) {
    return proxyRequest(request, "/api/reports/inspection/search");
}


