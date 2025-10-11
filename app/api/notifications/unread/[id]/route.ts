import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const response = await proxyRequest(
    request,
    `/api/notifications/unread/${id}`
  );
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const body = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to fetch notifications", details: body },
        { status: response.status }
      );
    }

    const text = await response.text();
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: text },
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
}
