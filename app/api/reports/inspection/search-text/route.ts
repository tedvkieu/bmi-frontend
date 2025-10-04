import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_utils/proxy";

export async function POST(request: NextRequest) {
    return proxyRequest(request, "/api/reports/inspection/search-text");
}
