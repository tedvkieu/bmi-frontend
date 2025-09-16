import { proxyRequest } from "../_utils/proxy";

export async function GET(request: Request) {
    return proxyRequest(request, "/api/users");
}

export async function POST(request: Request) {
    return proxyRequest(request, "/api/users");
}


