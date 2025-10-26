import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_utils/proxy";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Extract query params from the incoming request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Append query params to the target path
    const targetPath = queryString
        ? `/api/reports/inspection/companies?${queryString}`
        : "/api/reports/inspection/companies";

    return proxyRequest(request, targetPath);
}
