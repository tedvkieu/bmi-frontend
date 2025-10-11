import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(request: NextRequest) {
  const response = await proxyRequest(request, "/api/notifications/unread");
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

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  const token = request.cookies.get("token")?.value;

  if (!id) {
    return NextResponse.json(
      { error: "Notification id is required" },
      { status: 400 }
    );
  }

  const headers = new Headers(request.headers);
  headers.set("content-type", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const proxyReq = new Request(request.url, {
    method: "POST",
    headers,
  });

  const response = await proxyRequest(
    proxyReq,
    `/api/notifications/${id}/read`
  );
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: response.status }
    );
  }

  return NextResponse.json({ success: true }, { status: response.status });
}
