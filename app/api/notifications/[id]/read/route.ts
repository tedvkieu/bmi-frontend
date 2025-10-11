import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const response = await proxyRequest(
    request,
    `/api/notifications/${id}/read`
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: response.status }
    );
  }

  return NextResponse.json({ success: true }, { status: response.status });
}
