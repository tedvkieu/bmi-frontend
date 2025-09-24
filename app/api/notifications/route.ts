import { NextRequest, NextResponse } from "next/server";

const BACKEND_API = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const res = await fetch(`${BACKEND_API}/api/notifications/unread`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  const token = request.cookies.get("token")?.value;

  const res = await fetch(`${BACKEND_API}/api/notifications/${id}/read`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to mark as read" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
