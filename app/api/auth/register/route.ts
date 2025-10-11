import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(request: NextRequest) {
  try {
    const response = await proxyRequest(request, "/api/auth/register");
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const fallback = await response.text();
      if (!response.ok) {
        return NextResponse.json(
          { message: fallback || "Đăng ký tài khoản thất bại" },
          { status: response.status }
        );
      }
      return new NextResponse(fallback, {
        status: response.status,
        headers: response.headers,
      });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Đăng ký tài khoản thất bại" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Auth proxy error:", error);
    return NextResponse.json(
      { message: "Lỗi kết nối đến server" },
      { status: 500 }
    );
  }
}
