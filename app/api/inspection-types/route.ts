import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(request: NextRequest) {
  try {
    const response = await proxyRequest(request, "/api/inspection-types");
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const errorBody = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorBody?.error || `Failed to fetch: ${response.status}` },
          { status: response.status }
        );
      }
      const text = await response.text();
      return NextResponse.json(
        { error: text || `Failed to fetch: ${response.status}` },
        { status: response.status }
      );
    }

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: response.headers,
      });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
