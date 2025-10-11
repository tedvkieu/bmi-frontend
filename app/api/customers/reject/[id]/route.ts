import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token" },
        { status: 401 }
      );
    }

    const headers = new Headers(req.headers);
    headers.set("authorization", `Bearer ${token}`);
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }

    const proxyReq = new Request(req.url, {
      method: "PUT",
      headers,
    });

    const response = await proxyRequest(
      proxyReq,
      `/api/customers/reject/${id}`
    );
    const contentType = response.headers.get("content-type") || "";

    let data: any = { success: true, message: "Tài khoản đã bị từ chối" };

    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => data);
    } else {
      const text = await response.text();
      if (text) {
        data = { success: true, message: text };
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Reject customer error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
