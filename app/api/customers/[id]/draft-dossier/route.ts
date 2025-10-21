import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyRequest(
      req,
      `/api/customers/${id}/draft-dossier`
    );

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!response.ok) {
        return NextResponse.json(
          { error: text || "Không thể khởi tạo hồ sơ" },
          { status: response.status }
        );
      }
      return new NextResponse(text, {
        status: response.status,
        headers: response.headers,
      });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data || "Không thể khởi tạo hồ sơ" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Error creating draft dossier:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
