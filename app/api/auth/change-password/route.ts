import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body ?? {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Thiếu thông tin mật khẩu" },
        { status: 400 }
      );
    }

    const headers = new Headers(req.headers);
    headers.set("content-type", "application/json");
    headers.set("authorization", `Bearer ${token}`);
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }

    const proxyReq = new Request(req.url, {
      method: "PUT",
      headers,
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const response = await proxyRequest(
      proxyReq,
      "/api/customers/change-password"
    );
    const contentType = response.headers.get("content-type") || "";

    let payload: any = {};
    if (contentType.includes("application/json")) {
      payload = await response.json().catch(() => ({}));
    } else {
      const text = await response.text();
      if (!response.ok) {
        return NextResponse.json(
          { message: text || "Đổi mật khẩu thất bại" },
          { status: response.status }
        );
      }
      payload = { message: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: payload.message || "Đổi mật khẩu thất bại" },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(
      { message: payload.message ?? "Đổi mật khẩu thành công" },
      { status: response.status }
    );
    nextResponse.cookies.set("token", "", { path: "/", expires: new Date(0) });

    return nextResponse;
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { message: err.message || "Đổi mật khẩu thất bại" },
      { status: 500 }
    );
  }
}
