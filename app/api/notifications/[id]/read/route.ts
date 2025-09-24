import { NextRequest, NextResponse } from "next/server";

const BACKEND_API = process.env.BACKEND_URL;

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value;
  const { id } = params;

  const res = await fetch(`${BACKEND_API}/api/notifications/${id}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
