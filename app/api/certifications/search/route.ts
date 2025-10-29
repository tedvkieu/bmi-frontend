import { NextRequest } from "next/server";
import { proxyRequest } from "../../_utils/proxy";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetPath = `/api/certifications/search${queryString ? `?${queryString}` : ""}`;

    return proxyRequest(request, targetPath);
}
